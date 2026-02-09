# Vocabulary Extraction from Textbook Images

This project extracts vocabulary words and definitions from textbook images and exports them to a CSV file.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Note:** On first run, EasyOCR will download language models (~100-200MB). This is a one-time download.

### 2. Verify Images

Ensure the following image files are in the project directory:
- IMG_2031.JPG through IMG_2039.JPG

## Usage

Run the extraction script:

```bash
python extract_vocab.py
```

### Expected Output

The script will:
1. Process each image sequentially
2. Extract vocabulary entries matching the pattern: `word (part_of_speech) definition`
3. Save results to `vocabulary.csv`
4. Log unparsed lines to `review.txt`

**Processing time:** Approximately 2-3 minutes per image (~20-30 minutes total).

### Progress Output

```
Processing IMG_2031.JPG... ✓ Found 47 entries (3 unparsed)
Processing IMG_2032.JPG... ✓ Found 52 entries (5 unparsed)
...
```

## Output Files

### vocabulary.csv

CSV file with columns:
- `word` - The vocabulary term
- `part_of_speech` - Part of speech (n., v., adj., etc.)
- `definition` - Full definition text
- `source_image` - Source image filename
- `confidence` - OCR confidence score (0.000-1.000)

**Example:**
```csv
word,part_of_speech,definition,source_image,confidence
augment,v.,to make greater,IMG_2031.JPG,0.952
authentic,adj.,real,IMG_2031.JPG,0.943
```

### review.txt

Log of text that couldn't be parsed as vocabulary entries. Use this to:
- Identify OCR errors
- Find entries that need manual correction
- Adjust regex patterns if needed

**Example:**
```
[IMG_2031.JPG] [conf: 0.87] "CHAPTER 3: VOCABULARY"
[IMG_2031.JPG] [conf: 0.92] "37"
```

## How It Works

1. **Preprocessing** (`preprocess.py`)
   - Converts images to grayscale
   - Enhances contrast
   - Splits two-column layout into separate regions

2. **OCR Extraction** (`extract_vocab.py`)
   - Uses EasyOCR to extract text from images
   - Returns text with confidence scores

3. **Filtering** (`filter.py`)
   - Removes headers, footers, page numbers
   - Filters out section markers (A, B, C, etc.)
   - Keeps only text with vocabulary pattern

4. **Parsing** (`parser.py`)
   - Extracts word, part of speech, and definition
   - Uses regex pattern matching
   - Cleans and normalizes text

5. **Export**
   - Appends results to CSV progressively
   - Logs unparsed entries for review

## Troubleshooting

### Low Entry Count

If few entries are extracted:
- Check `review.txt` for patterns
- Adjust regex in `parser.py`
- Try different preprocessing settings

### OCR Errors

If many OCR mistakes:
- Check image quality
- Adjust contrast enhancement in `preprocess.py`
- Consider using cloud OCR API for better accuracy

### Missing Entries

- Review source images for specific words
- Check if entries appear in `review.txt`
- Manually add missing entries to CSV

## Customization

### Change Column Detection

In `preprocess.py`, adjust `split_columns()` overlap parameter:
```python
overlap = 20  # Increase if words at column boundary are missed
```

### Adjust Filtering

In `filter.py`, modify margin threshold:
```python
margin = img_height * 0.12  # Increase to remove more header/footer content
```

### Modify Entry Pattern

In `parser.py`, adjust regex pattern to match different formats:
```python
pattern = r'^([a-zA-Z\s\-\']+?)\s*\(([^)]+)\)\s*(.+)$'
```

## License

MIT License
