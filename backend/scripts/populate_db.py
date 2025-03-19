import os
import sys

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import get_settings
from app.core.db import engine
from app.models.chat import ChatConversation, ChatMessage, MessageType
from app.models.customer import Customer
from app.models.customer_scenario import CustomerScenario
from app.models.scenario import Scenario
from app.models.scheme import Scheme
from app.models.user import User
from sqlmodel import Session, select


def populate_database():
    """
    Populate the database with initial data:
    - 1 scheme
    - 2 scenarios
    - 2 customers
    - 2 conversations with chat history
    """
    settings = get_settings()

    # Create a session
    with Session(engine) as session:
        # Check if admin user exists
        statement = select(User).where(User.username == "admin")
        admin_user = session.exec(statement).first()

        if not admin_user:
            print("Admin user not found. Please run create_admin.py first.")
            return

        # Create a scheme
        scheme = Scheme(
            name="Customer Support Training",
            description="A scheme for training customer support agents to handle various customer scenarios",
            created_by_id=admin_user.id,
        )
        session.add(scheme)
        session.commit()
        session.refresh(scheme)
        print(f"Created scheme with ID: {scheme.id}")

        # Create two scenarios
        scenario1 = Scenario(
            name="Product Return Inquiry",
            description="Customer wants to return a recently purchased item",
            system_prompt="You are a customer who recently purchased a product and wants to return it because it doesn't meet your expectations.",
            scheme_id=scheme.id,
            created_by_id=admin_user.id,
        )

        scenario2 = Scenario(
            name="Technical Support Issue",
            description="Customer is experiencing technical difficulties with the product",
            system_prompt="You are a frustrated customer having technical problems with your new device. You've tried restarting it multiple times without success.",
            scheme_id=scheme.id,
            created_by_id=admin_user.id,
        )

        session.add(scenario1)
        session.add(scenario2)
        session.commit()
        session.refresh(scenario1)
        session.refresh(scenario2)
        print(f"Created scenario 1 with ID: {scenario1.id}")
        print(f"Created scenario 2 with ID: {scenario2.id}")

        # Create two customers
        customer1 = Customer(
            name="John Doe",
            description="Regular customer with a calm demeanor",
            profile_prompt="You are a patient individual who prefers detailed explanations. You purchased a product last week and it's not functioning as expected.",
            created_by_id=admin_user.id,
        )

        customer2 = Customer(
            name="Jane Smith",
            description="Tech-savvy customer who values efficiency",
            profile_prompt="You are a busy professional who knows technology well. You expect quick and efficient solutions without unnecessary explanations.",
            created_by_id=admin_user.id,
        )

        session.add(customer1)
        session.add(customer2)
        session.commit()
        session.refresh(customer1)
        session.refresh(customer2)
        print(f"Created customer 1 with ID: {customer1.id}")
        print(f"Created customer 2 with ID: {customer2.id}")

        # Link customers to scenarios
        customer_scenario1 = CustomerScenario(
            name="John's Return Request",
            profile_prompt="You bought a blender that doesn't blend properly and want to return it for a refund.",
            customer_id=customer1.id,
            scenario_id=scenario1.id,
        )

        customer_scenario2 = CustomerScenario(
            name="Jane's Technical Issue",
            profile_prompt="Your new smartphone keeps crashing when you try to open certain apps. You've already tried factory resetting it.",
            customer_id=customer2.id,
            scenario_id=scenario2.id,
        )

        session.add(customer_scenario1)
        session.add(customer_scenario2)
        session.commit()
        session.refresh(customer_scenario1)
        session.refresh(customer_scenario2)
        print(f"Created customer-scenario 1 link with ID: {customer_scenario1.id}")
        print(f"Created customer-scenario 2 link with ID: {customer_scenario2.id}")

        # Create two conversations
        conversation1 = ChatConversation(
            scenario_id=scenario1.id,
            customer_id=customer1.id,
            customer_scenario_id=customer_scenario1.id,
        )

        conversation2 = ChatConversation(
            scenario_id=scenario2.id,
            customer_id=customer2.id,
            customer_scenario_id=customer_scenario2.id,
        )

        session.add(conversation1)
        session.add(conversation2)
        session.commit()
        session.refresh(conversation1)
        session.refresh(conversation2)
        print(f"Created conversation 1 with ID: {conversation1.id}")
        print(f"Created conversation 2 with ID: {conversation2.id}")

        # Add chat history for the first conversation (product return)
        chat_messages1 = [
            ChatMessage(
                sender_id=f"{customer1.id}",
                message="Hello, I recently purchased a blender from your store, but it's not working properly. I'd like to return it.",
                message_type=MessageType.USER,
                conversation_id=conversation1.id,
            ),
            ChatMessage(
                sender_id="agent",
                message="I'm sorry to hear that your blender isn't working as expected. I'd be happy to help you with the return process. Could you please provide your order number and the date of purchase?",
                message_type=MessageType.BOT,
                conversation_id=conversation1.id,
            ),
            ChatMessage(
                sender_id=f"{customer1.id}",
                message="Yes, my order number is #12345 and I purchased it last Monday, about a week ago.",
                message_type=MessageType.USER,
                conversation_id=conversation1.id,
            ),
            ChatMessage(
                sender_id="agent",
                message="Thank you for providing that information. Since it's been less than 30 days, you're eligible for a full refund. Would you prefer a refund to your original payment method or store credit?",
                message_type=MessageType.BOT,
                conversation_id=conversation1.id,
            ),
            ChatMessage(
                sender_id=f"{customer1.id}",
                message="I'd prefer a refund to my original payment method, please.",
                message_type=MessageType.USER,
                conversation_id=conversation1.id,
            ),
        ]

        # Add chat history for the second conversation (technical issue)
        chat_messages2 = [
            ChatMessage(
                sender_id=f"{customer2.id}",
                message="Hi, my new smartphone keeps crashing whenever I try to open certain apps. I've already tried factory resetting it but the problem persists.",
                message_type=MessageType.USER,
                conversation_id=conversation2.id,
            ),
            ChatMessage(
                sender_id="agent",
                message="I understand how frustrating that can be. To help troubleshoot this issue, could you tell me which specific apps are causing the crashes?",
                message_type=MessageType.BOT,
                conversation_id=conversation2.id,
            ),
            ChatMessage(
                sender_id=f"{customer2.id}",
                message="It happens with social media apps like Instagram and Twitter, and occasionally with the camera app.",
                message_type=MessageType.USER,
                conversation_id=conversation2.id,
            ),
            ChatMessage(
                sender_id="agent",
                message="Thank you for that information. Have you updated the phone to the latest software version? Sometimes crashes can be caused by compatibility issues with older versions.",
                message_type=MessageType.BOT,
                conversation_id=conversation2.id,
            ),
            ChatMessage(
                sender_id=f"{customer2.id}",
                message="Yes, I'm running the latest update. I just want this fixed quickly as I need my phone for work.",
                message_type=MessageType.USER,
                conversation_id=conversation2.id,
            ),
            ChatMessage(
                sender_id="agent",
                message="I understand this is urgent. Let's try clearing the cache for those apps. Go to Settings > Apps, select each problematic app, and choose 'Clear Cache'. If that doesn't work, we may need to check if there's a hardware issue.",
                message_type=MessageType.BOT,
                conversation_id=conversation2.id,
            ),
        ]

        # Add all messages to the session
        for message in chat_messages1 + chat_messages2:
            session.add(message)

        # Update the chat history in the customer_scenario models
        customer_scenario1.chat_history = [msg.message for msg in chat_messages1]
        customer_scenario2.chat_history = [msg.message for msg in chat_messages2]

        session.commit()
        print(f"Added {len(chat_messages1)} messages to conversation 1")
        print(f"Added {len(chat_messages2)} messages to conversation 2")

        print("Database populated successfully!")


if __name__ == "__main__":
    populate_database()
