"use client"
export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, PlusCircle, Edit, Trash2, RefreshCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { IDistrict } from "@/lib/models/district"
import { formatCurrency } from "@/lib/utils"

export default function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<IDistrict[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentDistrict, setCurrentDistrict] = useState<IDistrict | null>(null)
  const [name, setName] = useState("")
  const [deliveryCharge, setDeliveryCharge] = useState<number | "">("")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  if (typeof window === "undefined") return null

  const fetchDistricts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/districts")
      if (res.ok) {
        const data = await res.json()
        setDistricts(data)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to fetch districts.")
      }
    } catch (err) {
      setError("Network error or server issue.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDistricts()
  }, [fetchDistricts])

  const handleOpenDialog = (district?: IDistrict) => {
    setCurrentDistrict(district || null)
    setName(district?.name || "")
    setDeliveryCharge(district?.deliveryCharge ?? "")
    setIsActive(district?.isActive ?? true)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentDistrict(null)
    setName("")
    setDeliveryCharge("")
    setIsActive(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (!name || deliveryCharge === "") {
      toast({
        title: "Missing Fields",
        description: "District name and delivery charge are required.",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    const method = currentDistrict ? "PUT" : "POST"
    const url = currentDistrict ? `/api/admin/districts/${currentDistrict._id}` : "/api/admin/districts"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, deliveryCharge: Number(deliveryCharge), isActive }),
      })

      if (res.ok) {
        toast({
          title: currentDistrict ? "District Updated" : "District Created",
          description: currentDistrict ? "District details updated successfully." : "New district added successfully.",
          variant: "success",
        })
        handleCloseDialog()
        fetchDistricts() // Refresh the list
      } else {
        const errorData = await res.json()
        toast({
          title: currentDistrict ? "Update Failed" : "Creation Failed",
          description: errorData.message || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error submitting district:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDistrict = async (districtId: string) => {
    try {
      const res = await fetch(`/api/admin/districts/${districtId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast({
          title: "District Deleted",
          description: "District has been successfully deleted.",
          variant: "success",
        })
        fetchDistricts() // Refresh the list
      } else {
        const errorData = await res.json()
        toast({
          title: "Deletion Failed",
          description: errorData.message || "Failed to delete district.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Network error or server issue.",
        variant: "destructive",
      })
      console.error("Error deleting district:", error)
    }
  }

  if (loading && districts.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading districts...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Delivery Districts
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add District
              </Button>
              <Button variant="outline" size="sm" onClick={fetchDistricts}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Manage delivery districts and their charges.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-destructive">{error}</div>}

          {districts.length === 0 && !loading ? (
            <p className="text-center text-muted-foreground">No districts found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Delivery Charge</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district._id.toString()}>
                    <TableCell className="font-medium">{district.name}</TableCell>
                    <TableCell>{formatCurrency(district.deliveryCharge)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          district.isActive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {district.isActive ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(district)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the district and remove its
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDistrict(district._id.toString())}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentDistrict ? "Edit District" : "Add New District"}</DialogTitle>
            <DialogDescription>
              {currentDistrict ? "Make changes to this district." : "Add a new delivery district."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="districtName">District Name</Label>
              <Input
                id="districtName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryCharge">Delivery Charge (BDT)</Label>
              <Input
                id="deliveryCharge"
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value === "" ? "" : Number(e.target.value))}
                required
                disabled={submitting}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                disabled={submitting}
              />
              <Label htmlFor="isActive">Active for Delivery</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : currentDistrict ? (
                  "Save Changes"
                ) : (
                  "Add District"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
