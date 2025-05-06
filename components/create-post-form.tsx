"use client"

import type React from "react"

import { useState, type FormEvent, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"

export default function CreatePostForm() {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const supabase = createClientSupabaseClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size should be less than 5MB")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imageFile) {
      setError("Please enter some content or add an image")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      let imageUrl = null

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${user?.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("post-images").upload(filePath, imageFile)

        if (uploadError) {
          throw new Error("Error uploading image")
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Create post
      await supabase.from("posts").insert({
        user_id: user?.id,
        content: content.trim(),
        image_url: imageUrl,
      })

      // Reset form
      setContent("")
      removeImage()
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</div>}

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          rows={3}
        />

        {imagePreview && (
          <div className="relative mt-2 rounded-lg overflow-hidden">
            <div className="relative aspect-video w-full">
              <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-gray-800/70 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              <ImageIcon className="h-5 w-5 mr-1" />
              <span>Add Image</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !imageFile)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
