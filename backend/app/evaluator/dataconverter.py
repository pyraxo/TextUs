import pandas as pd

#This file is for processing data from cpf


file_path = r"backend\app\evaluator\Filtered_chat_transcript.xlsx"  # Update with your file path
df = pd.read_excel(file_path)

# Remove rows where "Assigned Officer" is "CPFBoard_TextUs"
df_cleaned = df[df["Assigned Officer"] != "CPFBoard_TextUs"]

# Identify bot-related responses and remove them
bot_users = ["CPFBoard_TextUs"]
df_cleaned = df_cleaned[~df_cleaned["Messaging User"].isin(bot_users)]

# Define messages to remove: "Yes", "No", or numbers 1-5
messages_to_remove = {"Yes", "No", "1", "2", "3", "4", "5"}

# Remove rows where "Message" contains only these values
df_cleaned = df_cleaned[~df_cleaned["Message"].astype(str).str.strip().isin(messages_to_remove)]

# Save the cleaned data
cleaned_file_path = "Cleaned_chat_transcript.xlsx"
df_cleaned.to_excel(cleaned_file_path, index=False)

print(f"Cleaned file saved as: {cleaned_file_path}")
