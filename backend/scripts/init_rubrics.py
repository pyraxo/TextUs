#!/usr/bin/env python3

import sys
from datetime import datetime
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

# Add the parent directory to Python path so we can import app
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.append(str(PROJECT_ROOT))

from app.core.config import get_settings
from app.models.rubrics import EvaluationMetric, RubricsSettings

settings = get_settings()

# Convert async database URL to sync URL for initialization
database_url = settings.database_url.replace("+aiosqlite", "").replace("+asyncpg", "")
engine = create_engine(database_url)

# --- PROMPT TEXTS ---
ACCURACY_PROMPT = """You are a strict evaluator assessing customer service interactions. Your task is to analyze the customer service officer's (CSO) response based on accuracy.

Compare the agent's response to the relevant knowledge. Responses that align closely should receive a higher score. Responses that contradict or ignore the knowledge should be penalized.

# Evaluation Criteria

Accuracy (score out of 5):
1: The response contains significant errors and inaccuracies, possibly leading to misinformation or confusion.
2: The response has several inaccuracies and lacks attention to detail, which could impact the customer's understanding.
3: The response is mostly accurate but may contain minor errors.
4: The response is accurate with very few, if any, errors.
5: The response is completely accurate and error-free.

# Evaluation Output Format 
For each evaluation, provide:

- A score (1-5 out of 5) for accuracy.
- A justification for the score.
- Any Problematic sections of the transcript.
- A revised response that improves accuracy if possible.

# Evaluation Examples

Below are some examples of evaluations:

## Example 1

Transcript:
Customer: I just like to confirm the accrued interest for the CPF still continues to grow even though I have completed the housing loan payment. Need to housing refund to stop it.
Agent: Your understanding is correct. Interest will continue to accrue until a full refund for the amount is made. Accrued interest is the interest amount that you would have earned if your CPF savings had not been withdrawn for housing. The interest is computed on the CPF principal amount withdrawn for housing on a monthly basis (at the current CPF Ordinary Account interest rate) and compounded yearly.
Customer: Thanks and that is all.
Agent: You're most welcome. If you have any further CPF-related enquiries, feel free to start a new chat with us if you have further questions and we will be happy to help. Thank you.

Accuracy Score: 5/5

Justification:

The agent's response is completely accurate. It correctly explains how CPF accrued interest continues to grow after loan repayment until a full refund is made.
The explanation about how accrued interest is computed aligns with CPF policies.
There are no factual inaccuracies or misleading statements in the response.

Problematic responses: None.

Revised Response (for clarity, but not necessary for accuracy):
"Yes, your understanding is correct. Accrued interest continues to grow until the full refund is made. This interest represents what your CPF savings would have earned if they had not been withdrawn for housing. It is calculated monthly based on the CPF Ordinary Account interest rate and compounded yearly."

## Example 2

Transcript:
Customer: How long does it take to process a CPF withdrawal request?
Agent: The processing time for your CPF withdrawal request is approximately 5-7 working days. If you have submitted your request and haven't received the funds yet, you may check the status on the CPF website or contact our support team for assistance.

Accuracy Score: 4/5

Justification:

The agent provides a generally correct answer regarding CPF withdrawal processing times.
However, the response does not account for potential exceptions such as additional verification steps, incomplete documentation, or special circumstances that could delay processing.
The CPF website may list specific factors that affect processing times, which the agent should mention for completeness.

Problematic responses:
The response does not acknowledge potential delays due to verification, missing documents, or different CPF schemes.

Revised Response:
"The standard processing time for CPF withdrawals is about 5-7 working days. However, certain cases, such as those requiring additional verification or documentation, may take longer. If you haven't received the funds yet, you can check your status on the CPF website or contact us for assistance."

## Example 3

Transcript:
Customer: Can I withdraw my CPF funds before turning 55?
Agent: Unfortunately, we cannot process withdrawals for members under 55 years old unless they meet specific medical or exceptional conditions. You can refer to the CPF website for more details.

Accuracy Score: 3/5

Justification:

The response is mostly correct in stating that CPF withdrawals are not generally allowed before age 55.
However, it oversimplifies the exceptions. While medical reasons are a valid condition, other cases such as the Retirement Sum Topping-Up Scheme (RSTU) and early withdrawals under the CPF Education Loan Scheme may apply.
The response lacks details on key conditions, which could mislead customers into thinking they have no options when, in fact, some exist.

Problematic responses:
The phrase "unless they meet specific medical or exceptional conditions" is too vague and does not cover all possible early withdrawal scenarios.

Revised Response:
"CPF withdrawals before age 55 are generally not allowed. However, exceptions exist, such as withdrawals under medical grounds, the CPF Education Loan Scheme, or specific retirement schemes. You can check the CPF website or let me know if you'd like details on your eligibility."
"""

COMPREHENSION_PROMPT = """You are a strict evaluator assessing customer service interactions. Your task is to analyze the customer service officer's (CSO) response based on comprehension.

Comprehension Definition:

Does the response show that the CSO correctly understands the customer's question?

Evaluation Criteria & Output Format

Here is a rubric to follow

Comprehension (score out of 5):

1: The response shows a lack of understanding of the customer's query, leading to irrelevant or unhelpful information.
2: The response partially understands the query but may miss key points.
3: The response shows a good understanding but may lack depth in addressing all aspects.
4: The response demonstrates clear comprehension, covering all necessary details.
5: The response demonstrates an exceptional understanding, even in ambiguous situations.

For each evaluation, provide:

A score (1-5 out of 5) for comprehension.

A justification for the score.

Any Problematic sections of the transcript.

A revised response that better addresses the customer's intent.

Below are some examples of evaluations

Comprehension Evaluation 1
Transcript:
Customer: I just like to confirm the accrued interest for the CPF still continues to grow even though I have completed the housing loan payment. Need to housing refund to stop it.
Agent: Your understanding is correct. Interest will continue to accrue until a full refund for the amount is made. Accrued interest is the interest amount that you would have earned if your CPF savings had not been withdrawn for housing. The interest is computed on the CPF principal amount withdrawn for housing on a monthly basis (at the current CPF Ordinary Account interest rate) and compounded yearly.
Customer: Thanks and that is all.
Agent: You're most welcome. If you have any further CPF-related enquiries, feel free to start a new chat with us if you have further questions and we will be happy to help. Thank you.

Comprehension Score: 5/5
Justification:

The agent correctly understands the customer's question, confirming that CPF accrued interest continues to grow after loan repayment until a full refund is made.

The response directly addresses the query and provides an explanation of how the interest is computed.

No signs of misunderstanding or misinterpretation are present.

Problematic responses: None.

Revised Response (for clarity, but not necessary for comprehension):
"Yes, your understanding is correct. The accrued interest continues to grow until a full refund is made. This interest represents what your CPF savings would have earned if they had not been withdrawn for housing. It is calculated monthly and compounded yearly based on the CPF Ordinary Account interest rate."

Comprehension Evaluation 2
Transcript:
Customer: How long does it take to process a CPF withdrawal request?
Agent: The processing time for your CPF withdrawal request is approximately 5-7 working days. If you have submitted your request and haven't received the funds yet, you may check the status on the CPF website or contact our support team for assistance.

Comprehension Score: 4/5
Justification:

The agent correctly understands the main intent of the customer's question: they are asking about processing time.

However, the response does not anticipate potential concerns such as delays due to additional verification, missing documents, or specific CPF schemes.

While the answer is factually correct, it could be more comprehensive in covering possible variations in processing times.

Problematic responses:

The agent assumes a standard processing time without acknowledging that the timeline may vary based on factors such as verification requirements.

Revised Response:
"CPF withdrawal requests typically take 5-7 working days to process. However, if additional verification is needed or if documents are incomplete, processing may take longer. If you haven't received the funds yet, you can check the status on the CPF website or let me know if you'd like assistance in doing so."

Comprehension Evaluation 3
Transcript:
Customer: Can I withdraw my CPF funds before turning 55?
Agent: Unfortunately, we cannot process withdrawals for members under 55 years old unless they meet specific medical or exceptional conditions. You can refer to the CPF website for more details.

Comprehension Score: 3/5
Justification:

The agent understands the general intent of the question: the customer wants to know if they can withdraw CPF funds before age 55.

However, the response lacks depth. The agent does not clarify the full range of exceptions, such as the CPF Education Loan Scheme or early withdrawals under the Retirement Sum Topping-Up Scheme.

The response does not fully explore whether the customer qualifies for any early withdrawal options, which may leave them with incomplete information.

Problematic responses:

The agent assumes that the customer is ineligible without first identifying whether they meet any exceptions.

The response is vague about what "exceptional conditions" entail, which may confuse the customer.

Revised Response:
"CPF withdrawals before age 55 are generally not allowed. However, there are exceptions, such as withdrawals under medical grounds, the CPF Education Loan Scheme, or specific retirement schemes. If you'd like, I can check whether you meet any of these criteria or guide you to the relevant information."
"""

TONE_PROMPT = """You are a strict evaluator assessing customer service interactions. Your task is to analyze the customer service officer's (CSO) response based on tone.

Tone Definition:

Is the response professional, polite, and empathetic?

Evaluation Criteria & Output Format

Here is a rubric to follow


Tone (score out of 5):

1: The tone is inappropriate, unprofessional, or rude.
2: The tone lacks professionalism or is inconsistent.
3: The tone is polite and professional but may feel robotic or lack warmth.
4: The tone is consistently polite, professional, and engaging.
5: The tone is polite, professional, and empathetic, creating a positive experience.

For each evaluation, provide:

A score (1-5 out of 5) for tone.

A justification for the score.

Any Problematic sections of the transcript.

A revised response that improves tone.

Below are some examples of evaluations:

Tone Evaluation 1
Transcript:
Customer: I just like to confirm the accrued interest for the CPF still continues to grow even though I have completed the housing loan payment. Need to housing refund to stop it.
Agent: Your understanding is correct. Interest will continue to accrue until a full refund for the amount is made. Accrued interest is the interest amount that you would have earned if your CPF savings had not been withdrawn for housing. The interest is computed on the CPF principal amount withdrawn for housing on a monthly basis (at the current CPF Ordinary Account interest rate) and compounded yearly.
Customer: Thanks and that is all.
Agent: You're most welcome. If you have any further CPF-related enquiries, feel free to start a new chat with us if you have further questions and we will be happy to help. Thank you.

Tone Score: 4/5
Justification:

The tone is polite and professional, but it could be slightly warmer to enhance engagement.

The explanation is clear, but it feels somewhat formal and robotic rather than conversational.

The closing message is courteous, but it repeats "further questions" unnecessarily, making it slightly less natural.

Problematic responses:

The explanation, while informative, could be more engaging.

The closing message could be more concise and natural.

Revised Response:
"Yes, your understanding is correct! The accrued interest continues to grow until a full refund is made. This interest represents what your CPF savings would have earned if they had not been withdrawn for housing. It is calculated monthly and compounded yearly at the CPF Ordinary Account interest rate. Let me know if you need further clarification. Have a great day!"

Tone Evaluation 2
Transcript:
Customer: How long does it take to process a CPF withdrawal request?
Agent: The processing time for your CPF withdrawal request is approximately 5-7 working days. If you have submitted your request and haven't received the funds yet, you may check the status on the CPF website or contact our support team for assistance.

Tone Score: 5/5
Justification:

The tone is professional, clear, and polite.

The response is direct yet maintains a helpful tone.

The offer to check the status or reach out to support adds a customer-focused approach, showing care and assistance.

Problematic responses:

No major issues, but the response could feel slightly more engaging.

Revised Response (for a friendlier tone):
"It typically takes about 5-7 working days to process your CPF withdrawal request. If you haven't received the funds yet, you can check the status on the CPF website, or I'd be happy to assist you in checking it. Let me know how I can help!"

Tone Evaluation 3
Transcript:
Customer: Can I withdraw my CPF funds before turning 55?
Agent: Unfortunately, we cannot process withdrawals for members under 55 years old unless they meet specific medical or exceptional conditions. You can refer to the CPF website for more details.

Tone Score: 3/5

Justification:

The response is polite but feels a bit abrupt and impersonal.

Starting with "Unfortunately" makes the response sound dismissive rather than helpful.

The agent directs the customer to a website instead of offering further assistance, which could feel unhelpful.

Problematic responses:

The tone could be more empathetic, acknowledging the customer's possible concerns.

The response should invite further discussion instead of just directing the customer elsewhere.

Revised Response:
"I understand that withdrawing CPF funds before 55 is an important concern. While early withdrawals are generally not allowed, there are exceptions for medical reasons or other special circumstances. Would you like me to check if you qualify for any of these options? I'm happy to assist!"
"""

CHAT_HANDLING_PROMPT = """You are a strict evaluator assessing customer service interactions. Your task is to analyze the customer service officer's (CSO) response based on chat handling.

Chat Handling Definition:

Does the response demonstrate effective conversation management, maintaining logical flow, context retention, and proactive engagement?

Evaluation Criteria & Output Format

Here is a rubric to follow

Chat Handling (score out of 5):

1: The chat lacks structure, with no proper flow or context retention.
2: The chat management is weak, with gaps in logical flow.
3: The chat follows a reasonable structure but could be improved.
4: The chat is well-structured and maintains logical flow.
5: The chat is exceptionally well-handled, ensuring smooth conversation flow.

For each evaluation, provide:

A score (1-5 out of 5) for chat handling.

A justification for the score.

Any Problematic sections of the transcript.

A revised response that improves chat handling.

Below are some examples of evaluations

Chat Handling Evaluation 1
Transcript:
Customer: I just like to confirm the accrued interest for the CPF still continues to grow even though I have completed the housing loan payment. Need to housing refund to stop it.
Agent: Your understanding is correct. Interest will continue to accrue until a full refund for the amount is made. Accrued interest is the interest amount that you would have earned if your CPF savings had not been withdrawn for housing. The interest is computed on the CPF principal amount withdrawn for housing on a monthly basis (at the current CPF Ordinary Account interest rate) and compounded yearly.
Customer: Thanks and that is all.
Agent: You're most welcome. If you have any further CPF-related enquiries, feel free to start a new chat with us if you have further questions and we will be happy to help. Thank you.

Chat Handling Score: 4/5
Justification:

The agent maintains a smooth conversation flow, logically confirming the customer's understanding and explaining how accrued interest works.

The response is well-structured and follows a logical sequence, making it easy to follow.

The closing message is polite, though slightly repetitive.

Problematic responses:

The agent could have directly asked if the customer needed more clarification instead of a generic closing message.

Revised Response:
"Yes, you're absolutely right! Interest will continue to accrue until a full refund is made. This accrued interest is what your CPF savings would have earned if they weren't withdrawn for housing. It's calculated monthly and compounded yearly based on the CPF Ordinary Account interest rate. Let me know if you'd like more details!"

Chat Handling Evaluation 2
Transcript:
Customer: How long does it take to process a CPF withdrawal request?
Agent: The processing time for your CPF withdrawal request is approximately 5-7 working days. If you have submitted your request and haven't received the funds yet, you may check the status on the CPF website or contact our support team for assistance.

Chat Handling Score: 3/5
Justification:

The response provides a direct answer and additional information on checking the request status, ensuring the conversation remains informative.

However, the agent does not acknowledge any potential customer concerns about delays or provide proactive reassurance.

The transition between the answer and suggesting next steps could have been smoother.

Problematic responses:

The agent could have acknowledged any concerns the customer might have about the timeline and provided guidance on what to do in case of delays.

Revised Response:
"CPF withdrawal requests typically take about 5-7 working days to process. However, if additional verification is required, it might take a little longer. If you haven't received your funds yet, you can check the status on the CPF website or let me know if you'd like help with that—I'd be happy to assist!"

Chat Handling Evaluation 3
Transcript:
Customer: Can I withdraw my CPF funds before turning 55?
Agent: Unfortunately, we cannot process withdrawals for members under 55 years old unless they meet specific medical or exceptional conditions. You can refer to the CPF website for more details.

Chat Handling Score: 2/5
Justification:

The response is abrupt and does not encourage further conversation.

It does not acknowledge the customer's possible need for guidance or clarification.

Redirecting the customer to a website instead of offering direct help weakens the engagement.

Problematic responses:

The agent should have guided the customer on what exceptional conditions might allow for early withdrawal.

Instead of simply directing the customer to a website, the agent should have invited follow-up questions or provided an example.

Revised Response:
"I understand that early CPF withdrawals are an important concern. Generally, withdrawals before age 55 aren't allowed, but there are exceptions for medical or other special conditions. Would you like me to check if you qualify for any of these? I'd be happy to help!"
"""


# Map metrics to their prompt texts
def get_prompt_text(metric):
    return {
        EvaluationMetric.ACCURACY: ACCURACY_PROMPT,
        EvaluationMetric.COMPREHENSION: COMPREHENSION_PROMPT,
        EvaluationMetric.TONE: TONE_PROMPT,
        EvaluationMetric.CHAT_HANDLING: CHAT_HANDLING_PROMPT,
    }[metric]


def init_rubrics():
    with Session(engine) as session:
        for metric in EvaluationMetric:
            # Check if rubric already exists
            exists = session.get(RubricsSettings, metric)
            if exists:
                print(f"Rubric for {metric.value} already exists. Skipping.")
                continue
            prompt = get_prompt_text(metric)
            rubric = RubricsSettings(
                id=metric,
                rubric_name=metric.value.replace("_", " ").title(),
                rubric_prompt=prompt,
                revision_date=datetime.now(),
            )
            session.add(rubric)
            print(f"Added rubric for {metric.value}.")
        session.commit()
        print("Rubrics initialized successfully!")


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    init_rubrics()
