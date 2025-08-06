"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Search, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface District {
  id: string;
  name: string;
  delivery_charge: number;
  created_at: string;
  updated_at: string;
}

export default function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    delivery_charge: 0,
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from("districts")
        .select("*")
        .order("name");

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Failed to fetch districts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDistrict) {
        // Update existing district
        const { error } = await supabase
          .from("districts")
          .update({
            name: formData.name,
            delivery_charge: formData.delivery_charge,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingDistrict.id);

        if (error) throw error;
        toast.success("District updated successfully");
      } else {
        // Create new district
        const { error } = await supabase.from("districts").insert([
          {
            name: formData.name,
            delivery_charge: formData.delivery_charge,
          },
        ]);

        if (error) throw error;
        toast.success("District created successfully");
      }

      setIsDialogOpen(false);
      setEditingDistrict(null);
      resetForm();
      fetchDistricts();
    } catch (error) {
      console.error("Error saving district:", error);
      toast.error("Failed to save district");
    }
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    setFormData({
      name: district.name,
      delivery_charge: district.delivery_charge,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This may affect existing orders.`,
      )
    )
      return;

    try {
      const { error } = await supabase.from("districts").delete().eq("id", id);

      if (error) throw error;

      setDistricts(districts.filter((district) => district.id !== id));
      toast.success("District deleted successfully");
    } catch (error) {
      console.error("Error deleting district:", error);
      toast.error("Failed to delete district");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      delivery_charge: 0,
    });
  };

  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Districts</h1>
          <p className="text-gray-600">Manage delivery areas and charges</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingDistrict(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add District
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDistrict ? "Edit District" : "Add New District"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">District Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Dhaka, Chittagong"
                  required
                />
              </div>

              <div>
                <Label htmlFor="delivery_charge">Delivery Charge (৳)</Label>
                <Input
                  id="delivery_charge"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.delivery_charge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery_charge: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="60"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDistrict ? "Update" : "Create"} District
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Total Districts: <strong>{districts.length}</strong>
          </span>
          <span>
            Avg Delivery:{" "}
            <strong>
              ৳
              {districts.length > 0
                ? Math.round(
                    districts.reduce((sum, d) => sum + d.delivery_charge, 0) /
                      districts.length,
                  )
                : 0}
            </strong>
          </span>
        </div>
      </div>

      {/* Districts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Districts ({filteredDistricts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDistricts.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery
                  ? "No districts found matching your search"
                  : "No districts found"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District Name</TableHead>
                  <TableHead>Delivery Charge</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistricts.map((district) => (
                  <TableRow key={district.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{district.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          ৳{district.delivery_charge}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(district.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(district)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(district.id, district.name)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Districts</p>
                <p className="text-xl font-bold">{districts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Lowest Charge</p>
                <p className="text-xl font-bold">
                  ৳
                  {districts.length > 0
                    ? Math.min(...districts.map((d) => d.delivery_charge))
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Highest Charge</p>
                <p className="text-xl font-bold">
                  ৳
                  {districts.length > 0
                    ? Math.max(...districts.map((d) => d.delivery_charge))
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
