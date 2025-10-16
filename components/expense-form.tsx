"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Upload, X, Camera, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Tesseract from 'tesseract.js'

interface ExpenseFormProps {
  onSubmit: (expense: any) => void
  initialData?: {
    description?: string
    amount?: number
    category?: string
  }
}

export function ExpenseForm({ onSubmit, initialData }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    amount: initialData?.amount || "",
    category: initialData?.category || "",
    date: new Date(),
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: "food", label: "Food & Dining", color: "bg-orange-500" },
    { value: "transport", label: "Transportation", color: "bg-blue-500" },
    { value: "shopping", label: "Shopping", color: "bg-purple-500" },
    { value: "entertainment", label: "Entertainment", color: "bg-pink-500" },
    { value: "movies", label: "Movies & Shows", color: "bg-teal-500" },
    { value: "birthday", label: "Birthday & Gifts", color: "bg-indigo-500" },
    { value: "travel", label: "Travel & Vacation", color: "bg-cyan-500" },
    { value: "health", label: "Healthcare", color: "bg-green-500" },
    { value: "fitness", label: "Fitness & Sports", color: "bg-emerald-500" },
    { value: "education", label: "Education & Learning", color: "bg-violet-500" },
    { value: "utilities", label: "Bills & Utilities", color: "bg-yellow-500" },
    { value: "housing", label: "Housing & Rent", color: "bg-slate-500" },
    { value: "insurance", label: "Insurance", color: "bg-blue-600" },
    { value: "subscriptions", label: "Subscriptions", color: "bg-purple-600" },
    { value: "pets", label: "Pet Care", color: "bg-amber-500" },
    { value: "charity", label: "Charity & Donations", color: "bg-rose-500" },
    { value: "business", label: "Business Expenses", color: "bg-gray-600" },
    { value: "taxes", label: "Taxes & Fees", color: "bg-red-600" },
    { value: "investments", label: "Investments", color: "bg-green-600" },
    { value: "other", label: "Other", color: "bg-gray-500" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const expense = {
      id: Date.now().toString(),
      description: formData.description,
      amount: Number.parseFloat(formData.amount.toString()),
      category: formData.category,
      date: formData.date.toISOString(),
      notes: formData.notes,
      receiptImage: uploadedImage,
      createdAt: new Date().toISOString(),
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSubmit(expense)

    // Reset form
    setFormData({
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      notes: "",
    })
    setUploadedImage(null)

    setIsSubmitting(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setIsProcessingImage(true)

    try {
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageDataUrl = event.target?.result as string
        setUploadedImage(imageDataUrl)

        // Perform OCR
        try {
          const result = await Tesseract.recognize(imageDataUrl, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
              }
            },
          })

          const extractedText = result.data.text
          console.log('Extracted text:', extractedText)

          // Parse the text using the API
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ extractedText }),
          })

          if (response.ok) {
            const parsedData = await response.json()
            
            // Auto-fill form fields
            if (parsedData.amount) {
              setFormData((prev) => ({ ...prev, amount: parsedData.amount.toString() }))
            }
            if (parsedData.description) {
              setFormData((prev) => ({ ...prev, description: parsedData.description }))
            }
            if (parsedData.category) {
              setFormData((prev) => ({ ...prev, category: parsedData.category }))
            }
            if (parsedData.date) {
              try {
                const parsedDate = new Date(parsedData.date)
                if (!isNaN(parsedDate.getTime())) {
                  setFormData((prev) => ({ ...prev, date: parsedDate }))
                }
              } catch (err) {
                console.error('Error parsing date:', err)
              }
            }

            // Add extracted text to notes
            setFormData((prev) => ({ 
              ...prev, 
              notes: `Extracted from receipt${parsedData.merchant ? ` - ${parsedData.merchant}` : ''}\n\n${prev.notes}` 
            }))
          }
        } catch (error) {
          console.error('OCR Error:', error)
          alert('Failed to extract text from image. You can still fill the form manually.')
        }

        setIsProcessingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
      setIsProcessingImage(false)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Upload Bill/Receipt (Optional)</Label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                >
                  {isProcessingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
                {uploadedImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={removeImage}
                    disabled={isProcessingImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {uploadedImage && (
                <div className="relative rounded-lg border overflow-hidden">
                  <img
                    src={uploadedImage}
                    alt="Receipt preview"
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                </div>
              )}
              {isProcessingImage && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting data from receipt...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Lunch at McDonald's"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", category.color)} />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Expense..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
