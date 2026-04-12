"""
Generate Bangla number audio clips using Microsoft Edge Neural TTS.
Voice: bn-BD-NabanitaNeural (professional female Bangla voice)

Generates:
  - 0.mp3 to 99.mp3  (unique Bangla number words)
  - sho.mp3           (শো — hundred suffix)
  - hazar.mp3         (হাজার — thousand)

Usage: python3 scripts/generate-bangla-audio.py
"""

import asyncio
import os
import edge_tts

VOICE = "bn-BD-NabanitaNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "bangla")

# Unique Bangla words for 0–99
BANGLA_NUMBERS = [
    "শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
    "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ",
    "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আঠাশ", "উনত্রিশ",
    "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাতত্রিশ", "আটত্রিশ", "উনচল্লিশ",
    "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "উনপঞ্চাশ",
    "পঞ্চাশ", "একান্ন", "বায়ান্ন", "তিপান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপান্ন", "সাতান্ন", "আটান্ন", "উনষাট",
    "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "উনসত্তর",
    "সত্তর", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "উনআশি",
    "আশি", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "উননব্বই",
    "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই",
]

# Additional building blocks
EXTRAS = {
    "sho": "শো",
    "hazar": "হাজার",
}


async def generate_clip(text, filepath):
    """Generate a single audio clip."""
    communicate = edge_tts.Communicate(text, VOICE, rate="-15%")
    await communicate.save(filepath)


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    tasks = []

    # Generate 0–99
    for i, word in enumerate(BANGLA_NUMBERS):
        path = os.path.join(OUTPUT_DIR, f"{i}.mp3")
        if not os.path.exists(path):
            tasks.append((word, path, i))

    # Generate extras
    for key, word in EXTRAS.items():
        path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
        if not os.path.exists(path):
            tasks.append((word, path, key))

    total = len(tasks)
    if total == 0:
        print("All audio files already exist. Delete them to regenerate.")
        return

    print(f"Generating {total} Bangla audio clips with voice: {VOICE}")

    for idx, (word, path, label) in enumerate(tasks):
        print(f"  [{idx + 1}/{total}] {label}: {word}")
        await generate_clip(word, path)

    print(f"\nDone! {total} files saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
