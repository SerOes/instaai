"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { 
  ImagePlus, 
  Trash2, 
  Download, 
  Upload,
  X,
  Check,
  Loader2,
  FolderOpen,
  Wand2,
  MoreVertical,
  Eye,
  ZoomIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UploadedImage {
  id: string
  title: string
  fileUrl: string
  thumbnailUrl: string
  aspectRatio?: string
  createdAt: string
  metadata?: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch("/api/upload/image")
      if (response.ok) {
        const data = await response.json()
        setImages(data.images)
      }
    } catch (err) {
      console.error("Error fetching images:", err)
      setError("Fehler beim Laden der Bilder")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleUpload = async (files: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const totalFiles = files.length
    let uploaded = 0

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", file.name.replace(/\.[^/.]+$/, ""))

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Upload fehlgeschlagen")
        }

        uploaded++
        setUploadProgress((uploaded / totalFiles) * 100)
      } catch (err) {
        console.error("Upload error:", err)
        setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
      }
    }

    await fetchImages()
    setIsUploading(false)
    setUploadProgress(0)
  }

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/upload/image?id=${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter((img) => img.id !== imageId))
        setDeleteConfirm(null)
      } else {
        const data = await response.json()
        setError(data.error || "Löschen fehlgeschlagen")
      }
    } catch (err) {
      console.error("Delete error:", err)
      setError("Fehler beim Löschen")
    }
  }

  const handleDownload = async (image: UploadedImage) => {
    try {
      const response = await fetch(image.fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${image.title}.${image.fileUrl.split('.').pop()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const parseMetadata = (metadataStr?: string) => {
    if (!metadataStr) return null
    try {
      return JSON.parse(metadataStr)
    } catch {
      return null
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unbekannt"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meine Bilder</h1>
          <p className="mt-1 text-muted-foreground">
            Verwalte deine hochgeladenen Bilder und nutze sie als Referenz
          </p>
        </div>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading... {Math.round(uploadProgress)}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Bilder hochladen
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Drop Zone */}
      <Card 
        className="border-dashed border-2 border-border/50 bg-card/30 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <ImagePlus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            Bilder hier ablegen
          </p>
          <p className="text-sm text-muted-foreground">
            oder klicken zum Auswählen • JPEG, PNG, WebP, GIF • Max. 10MB
          </p>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Noch keine Bilder hochgeladen
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Lade Bilder hoch, um sie als Referenz zu verwenden
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className={`group relative overflow-hidden border-border/50 bg-card/50 hover:border-primary/50 transition-all duration-200 ${
                selectedImage?.id === image.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div 
                className="aspect-square relative cursor-pointer"
                onClick={() => setPreviewImage(image)}
              >
                <img
                  src={image.thumbnailUrl || image.fileUrl}
                  alt={image.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className="h-9 w-9"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage(image)
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className="h-9 w-9"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/dashboard/generate/image?referenceId=${image.id}`
                    }}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Selected Indicator */}
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 rounded-full bg-primary p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate flex-1">
                    {image.title}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewImage(image)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Vorschau
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.location.href = `/dashboard/generate/image?referenceId=${image.id}`}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Als Referenz nutzen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(image)}>
                        <Download className="mr-2 h-4 w-4" />
                        Herunterladen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteConfirm(image.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(image.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
            <DialogDescription>
              Hochgeladen am {previewImage && formatDate(previewImage.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            {previewImage && (
              <>
                <img
                  src={previewImage.fileUrl}
                  alt={previewImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {(() => {
                    const meta = parseMetadata(previewImage.metadata)
                    return meta ? (
                      <>
                        <span>Größe: {formatFileSize(meta.size)}</span>
                        {meta.width && meta.height && (
                          <span>Auflösung: {meta.width} × {meta.height}</span>
                        )}
                        <span>Typ: {meta.mimeType}</span>
                      </>
                    ) : null
                  })()}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => window.location.href = `/dashboard/generate/image?referenceId=${previewImage.id}`}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Als Referenz nutzen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownload(previewImage)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Herunterladen
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bild löschen?</DialogTitle>
            <DialogDescription>
              Dieses Bild wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
