from pathlib import Path

import pandas as pd

file_path = Path("backend/app/evaluator/Filtered_chat_transcript.xlsx")
if not file_path.exists():
    raise FileNotFoundError(f"Input file not found: {file_path}")

df = pd.read_excel(file_path)

if "Assigned Officer" in df.columns:
    df = df[df["Assigned Officer"] != "CPFBoard_TextUs"]
else:
    raise KeyError("'Assigned Officer' column not found in the input file.")

bot_users = {"CPFBoard_TextUs"}
if "Messaging User" in df.columns:
    df = df[~df["Messaging User"].isin(bot_users)]
else:
    raise KeyError("'Messaging User' column not found in the input file.")

messages_to_remove = {"yes", "no", "1", "2", "3", "4", "5"}
if "Message" in df.columns:
    df = df[~df["Message"].astype(str).str.strip().str.lower().isin(messages_to_remove)]
else:
    raise KeyError("'Message' column not found in the input file.")

cleaned_file_path = file_path.parent / "Cleaned_chat_transcript.xlsx"
df.to_excel(cleaned_file_path, index=False)

print(f"Cleaned file saved as: {cleaned_file_path}")
