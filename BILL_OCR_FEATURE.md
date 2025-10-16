# Bill/Receipt OCR Feature

## Overview
The expense tracking system now supports automatic data extraction from bill/receipt images using OCR (Optical Character Recognition).

## How It Works

### 1. Upload a Receipt
- Navigate to the Expenses page
- Click "Add Expense" button
- In the expense form, you'll see an "Upload Bill/Receipt" section
- Click "Upload Image" and select a photo of your bill/receipt

### 2. Automatic Data Extraction
The system will automatically:
- Extract text from the image using Tesseract.js OCR
- Parse the extracted text to find:
  - **Amount**: Looks for currency symbols (₹) and total amounts
  - **Merchant Name**: Extracts the business/store name
  - **Date**: Identifies transaction date
  - **Category**: Intelligently determines the expense category based on keywords

### 3. Review and Submit
- The form fields will be auto-populated with extracted data
- Review and edit any fields if needed
- The receipt image will be stored with the expense
- Click "Add Expense" to save

### 4. View Receipt Later
- In the expenses list, transactions with receipts show a "Receipt" badge
- Click the badge to view the uploaded receipt image

## Supported Features

### OCR Recognition
- Currency amounts (Rs., ₹, decimal formats)
- Merchant/store names
- Transaction dates
- Common Indian receipt formats

### Smart Categorization
The system automatically categorizes expenses based on merchant names and keywords:
- **Food**: Restaurants, cafes, food courts
- **Transport**: Uber, Ola, fuel stations
- **Shopping**: Malls, retail stores, online shopping
- **Entertainment**: Movies, theaters, concerts
- **Healthcare**: Hospitals, pharmacies, clinics
- **Utilities**: Electricity, water, internet bills
- And more...

## Technical Details

### Technologies Used
- **Tesseract.js**: Client-side OCR engine
- **Next.js API Routes**: Backend processing
- **MongoDB**: Receipt image storage (base64)
- **React**: Frontend UI components

### Image Requirements
- **Format**: JPG, PNG, WEBP, or any image format
- **Size**: Maximum 5MB
- **Quality**: Clear, well-lit photos work best
- **Orientation**: Portrait or landscape

### Data Storage
- Receipt images are stored as base64 strings in MongoDB
- Images are linked to expense records
- Can be viewed anytime from the expenses list

## Tips for Best Results

1. **Good Lighting**: Take photos in well-lit conditions
2. **Clear Focus**: Ensure text is readable and not blurry
3. **Flat Surface**: Lay receipt flat to avoid distortion
4. **Full Receipt**: Capture the entire receipt including total amount
5. **Contrast**: Ensure good contrast between text and background

## API Endpoints

### POST /api/ocr
Processes extracted text and returns parsed data:
```json
{
  "extractedText": "Receipt text from Tesseract..."
}
```

Returns:
```json
{
  "amount": 1234.56,
  "description": "Merchant Name - ₹1234.56",
  "category": "food",
  "merchant": "Merchant Name",
  "date": "2024-01-15"
}
```

### POST /api/expenses
Creates new expense with optional receipt image:
```json
{
  "amount": 1234.56,
  "category": "food",
  "description": "Lunch at Restaurant",
  "date": "2024-01-15",
  "receiptImage": "data:image/jpeg;base64,..."
}
```

## Future Enhancements

- [ ] Multi-language OCR support
- [ ] Bulk receipt upload
- [ ] Receipt sharing between users
- [ ] Advanced receipt analysis (tax extraction, item-level details)
- [ ] Cloud storage integration (AWS S3, Google Cloud Storage)
- [ ] Receipt search by image similarity
- [ ] Automatic duplicate detection
