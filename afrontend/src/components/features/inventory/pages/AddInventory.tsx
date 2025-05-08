import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField } from "@mui/material";
import { MenuItem } from "@mui/material";

import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";

// Zod schema for validation
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  quantity: z.coerce.number().min(1, "Quantity is required"),
  costPerUnit: z.coerce.number().min(0, "Cost per unit is required"),
  anyCostIncurred: z.coerce.number().optional(),
  descriptionOfCost: z.string().optional(),
  salePricePerUnit: z.coerce.number().optional(),
});

const AddInventory = ({ itemToEdit, onClose, onUpdate }: any) => {
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [supplierId, setSupplierId] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      brand: "",
      quantity: 0,
      costPerUnit: 0,
      anyCostIncurred: 0,
      descriptionOfCost: "",
      salePricePerUnit: 0,
    },
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const inputLabelStyle = {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#374151",
  };

  const inputTextStyle = {
    fontSize: "1rem",
    fontFamily: "Inter, sans-serif",
  };

  const quantity = parseFloat(watch("quantity")?.toString() ?? "0");
  const costPerUnit = parseFloat(watch("costPerUnit")?.toString() ?? "0");
  const anyCostIncurred = parseFloat(
    watch("anyCostIncurred")?.toString() ?? "0"
  );
  const salePricePerUnit = parseFloat(
    watch("salePricePerUnit")?.toString() ?? "0"
  );

  const totalCosts = (quantity * costPerUnit + anyCostIncurred).toFixed(2);
  const totalCostOfSales = (quantity * salePricePerUnit).toFixed(2);

  useEffect(() => {
    if (itemToEdit) {
      reset(itemToEdit);
    }
  }, [itemToEdit, reset]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/supplier`);
        setSuppliers(res.data.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };

    fetchSuppliers();
  }, []);

  const onSubmit = async (data: any) => {
    console.log("API BASE URL:", import.meta.env.VITE_API_URL);

    let uploadedImage = "";

    //  1. Upload image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadedImage = res.data.file?.filename || "";
      } catch (error) {
        toast.error("Image upload failed");
        return;
      }
    }

    //  2. Prepare full payload
    const payload = {
      ...data,
      totalCosts,
      totalCostOfSales,
      image: uploadedImage,
      supplierId: supplierId || null,
    };

    try {
      if (itemToEdit) {
        // 3. If editing
        const itemId = itemToEdit._id || itemToEdit.id;
        await axios.put(
          `${import.meta.env.VITE_API_URL}/inventory/update/${itemId}`,
          payload
        );
        toast.success("Inventory updated successfully");
        onUpdate?.({
          ...payload,
          id: itemId,
          createdAt: itemToEdit?.createdAt || new Date().toISOString(),
        });
      } else {
        // 4. If adding new
        await axios.post(
          `${import.meta.env.VITE_API_URL}/inventory/add`,
          payload
        );
        toast.success("Inventory added successfully");
        reset();
      }

      setImageFile(null);
      setImagePreview("");
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Error submitting inventory form:", error);
      toast.error("Failed to save inventory");
    }
  };

  return (
    <div className="max-w-6xl p-10 mx-auto mt-20 text-black bg-white shadow-xl rounded-xl">
      <h2 className="mb-10 text-4xl font-bold text-center">
        {itemToEdit ? "Edit Inventory" : "Add Inventory"}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 "
      >
        <TextField
          id="name"
          label="Name"
          {...register("name")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{ sx: inputTextStyle }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown")
              document.getElementById("brand")?.focus();
          }}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />
        <TextField
          id="brand"
          label="Brand"
          {...register("brand")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{ sx: inputTextStyle }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") document.getElementById("name")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("quantity")?.focus();
          }}
          error={!!errors.brand}
          helperText={errors.brand?.message}
          fullWidth
        />
        <TextField
          id="quantity"
          type="number"
          label="Quantity"
          {...register("quantity")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{ sx: inputTextStyle }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") document.getElementById("brand")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("costPerUnit")?.focus();
          }}
          error={!!errors.quantity}
          helperText={errors.quantity?.message}
          fullWidth
        />
        <TextField
          id="costPerUnit"
          type="number"
          label="Cost per Unit"
          {...register("costPerUnit")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{ sx: inputTextStyle }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp")
              document.getElementById("quantity")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("anyCostIncurred")?.focus();
          }}
          error={!!errors.costPerUnit}
          helperText={errors.costPerUnit?.message}
          fullWidth
        />
        <TextField
          id="anyCostIncurred"
          type="number"
          label="Any Cost Incurred"
          {...register("anyCostIncurred")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{ sx: inputTextStyle }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp")
              document.getElementById("costPerUnit")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("descriptionOfCost")?.focus();
          }}
          fullWidth
        />
        <TextField
          id="descriptionOfCost"
          label="Description of Cost"
          {...register("descriptionOfCost")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{ sx: inputTextStyle }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp")
              document.getElementById("anyCostIncurred")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("totalCosts")?.focus();
          }}
          fullWidth
        />
        <TextField
          id="totalCosts"
          label="Total Costs"
          value={totalCosts}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{
            readOnly: true,
            sx: inputTextStyle,
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp")
              document.getElementById("descriptionOfCost")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("salePricePerUnit")?.focus();
          }}
          fullWidth
        />

        <TextField
          id="salePricePerUnit"
          type="number"
          label="Sale Price per Unit"
          {...register("salePricePerUnit")}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{
            sx: inputTextStyle,
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp")
              document.getElementById("totalCosts")?.focus();
            if (e.key === "ArrowDown")
              document.getElementById("totalCostOfSales")?.focus();
          }}
          fullWidth
        />

        <TextField
          id="totalCostOfSales"
          label="Total Cost of Sales"
          value={totalCostOfSales}
          InputLabelProps={{ sx: inputLabelStyle }}
          InputProps={{
            readOnly: true,
            sx: inputTextStyle,
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              document.getElementById("salePricePerUnit")?.focus();
            }
          }}
          fullWidth
        />
        <TextField
          select
          label="Supplier (optional)"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          fullWidth
        >
          <MenuItem value="">No Supplier</MenuItem>
          {suppliers.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
        {/* <div className="col-span-1 md:col-span-2">
          <label className="block mb-2 font-semibold">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="object-contain w-32 h-32 mt-2 border rounded"
            />
          )}
        </div> */}

        <div className="flex col-span-1 gap-4 mt-4 md:col-span-2">
          <Button
            type="submit"
            variant="contained"
            color="success"
            className="flex-1"
          >
            {itemToEdit ? "Update Item" : "Add Item"}
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
