import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  costPricePerUnit: number;
  salePricePerUnit: number;
}

const CustomerForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purchasedInventory, setPurchasedInventory] = useState("");
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [quantity, setQuantity] = useState("");
  const [costPricePerUnit, setCostPricePerUnit] = useState("");
  const [salePricePerUnit, setSalePricePerUnit] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [balance, setBalance] = useState("");
  const [isDebtor, setIsDebtor] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInventoryList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/inventory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const addedInventory = response.data;

        // TEMPORARY-TODO
        const customerPurchases = [
          { productId: "1", quantity: 10 },
          { productId: "2", quantity: 5 },
        ];

        const damagedItems = [
          { productId: "1", quantity: 2 },
          { productId: "2", quantity: 1 },
        ];

        //  Apply calculation: remaining = added - (purchased + damaged)
        const adjustedInventory = addedInventory.map((item: any) => {
          const purchased =
            customerPurchases.find(
              (p) => p.productId === item._id || p.productId === item.id
            )?.quantity || 0;
          const damaged =
            damagedItems.find(
              (d) => d.productId === item._id || d.productId === item.id
            )?.quantity || 0;
          const availableQty = item.quantity - (purchased + damaged);

          return {
            ...item,
            quantity: availableQty,
          };
        });

        setInventoryList(adjustedInventory);
      } catch (error) {
        console.error("Error fetching inventory list:", error);
        toast.error("Error fetching inventory list");
      }
    };

    fetchInventoryList();
  }, []);

  const handleInventoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedInventory = e.target.value;
    setPurchasedInventory(selectedInventory);

    const selectedItem = inventoryList.find(
      (item) => String(item._id) === selectedInventory
    );

    if (selectedItem) {
      setCostPricePerUnit(String(selectedItem.costPricePerUnit || 0));
      setSalePricePerUnit(String(selectedItem.salePricePerUnit || 0));
      calculateTotalAmount(quantity, selectedItem.salePricePerUnit || 0);
    } else {
      setCostPricePerUnit("0");
      setSalePricePerUnit("0");
      setTotalAmount("0");
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = e.target.value;
    const selectedItem = inventoryList.find(
      (item) => String(item._id) === purchasedInventory
    );

    if (selectedItem && parseFloat(qty) > selectedItem.quantity) {
      toast.warn(`You can only sell up to ${selectedItem.quantity} units.`, {
        position: "top-center",
      });
      setQuantity(String(selectedItem.quantity));
      calculateTotalAmount(String(selectedItem.quantity), salePricePerUnit);
    } else {
      setQuantity(qty);
      calculateTotalAmount(qty, salePricePerUnit);
    }
  };

  const calculateTotalAmount = (qty: string, price: string | number) => {
    const total = (parseFloat(qty) || 0) * (parseFloat(String(price)) || 0);
    setTotalAmount(total.toFixed(2));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const paymentValue = parseFloat(e.target.value) || 0;
    setPayment(String(paymentValue));
    const balanceValue = parseFloat(totalAmount) - paymentValue;
    setBalance(balanceValue.toFixed(2));
    setIsDebtor(balanceValue > 0);
    setPaymentStatus(balanceValue <= 0 ? "Paid" : "Pending");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!purchasedInventory) {
      toast.error("Please select an inventory item");
      setLoading(false);
      return;
    }

    const newCustomer = {
      name,
      email,
      phone,
      purchasedInventoryId: purchasedInventory,
      quantityPurchased: parseInt(quantity),
      costPricePerUnit: parseFloat(costPricePerUnit),
      salePricePerUnit: parseFloat(salePricePerUnit),
      totalAmount: parseFloat(totalAmount),
      payment: parseFloat(payment),
      balance: parseFloat(balance),
      isDebtor,
      paymentStatus,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/customers`,
        newCustomer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Customer saved:", response.data.data);
      toast.success("Customer added successfully");
      resetForm();
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Error adding customer");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPurchasedInventory("");
    setQuantity("");
    setCostPricePerUnit("");
    setSalePricePerUnit("");
    setTotalAmount("");
    setPayment("");
    setBalance("");
    setIsDebtor(false);
    setPaymentStatus("");
  };

  return (
    <Box className="max-w-6xl p-8 mx-auto mt-10 bg-white shadow-xl rounded-xl">
      <Typography
        id="form-title"
        variant="h4"
        className="mb-6 font-bold text-center text-gray-800"
      >
        Add Customer
      </Typography>
      <form
        role="form"
        aria-labelledby="form-title"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <TextField
          id="name"
          name="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />

        <TextField
          id="phone"
          name="phone"
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          fullWidth
        />

        <TextField
          select
          id="purchasedInventory"
          name="purchasedInventory"
          label="Purchased Inventory"
          value={purchasedInventory}
          onChange={handleInventoryChange}
          required
          fullWidth
        >
          <MenuItem value="">Select Inventory</MenuItem>
          {inventoryList.map((item) => (
            <MenuItem key={item._id} value={item._id}>
              {item.name} (Available: {item.quantity})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="number"
          name="number"
          type="number"
          label="Quantity"
          value={quantity}
          onChange={handleQuantityChange}
          required
          inputProps={{
            min: 1,
            max:
              inventoryList.find((item) => item._id === purchasedInventory)
                ?.quantity || 0,
          }}
          fullWidth
        />

        <TextField
          id="costPricePerUnit"
          name="costPricePerUnit"
          label="Cost Price per Unit"
          value={costPricePerUnit}
          InputProps={{
            readOnly: true,
            inputProps: {
              "aria-live": "polite",
            },
          }}
          fullWidth
        />

        <TextField
          id="salePricePerUnit"
          name="salePricePerUnit"
          label="Sale Price per Unit"
          value={salePricePerUnit}
          InputProps={{
            readOnly: true,
            inputProps: {
              "aria-live": "polite",
            },
          }}
          fullWidth
        />

        <TextField
          id="totalAmount"
          name="totalAmount"
          label="Total Amount"
          value={totalAmount}
          InputProps={{
            readOnly: true,
            inputProps: {
              "aria-live": "polite",
            },
          }}
          fullWidth
        />

        <TextField
          id="payment"
          name="payment"
          type="number"
          label="Payment"
          value={payment}
          onChange={handlePaymentChange}
          required
          fullWidth
        />

        <TextField
          id="balance"
          name="balance"
          label="Balance"
          value={balance}
          InputProps={{
            readOnly: true,
            inputProps: {
              "aria-live": "polite",
            },
          }}
          fullWidth
        />

        <FormControlLabel
          label={
            <Typography variant="body1" className="text-gray-800">
              Is Debtor
            </Typography>
          }
          control={
            <Checkbox
              checked={isDebtor}
              readOnly
              inputProps={{
                "aria-label": "Customer is a debtor",
              }}
            />
          }
        />

        <TextField
          id="paymentStatus"
          name="paymentStatus"
          label="Payment Status"
          value={paymentStatus}
          InputProps={{
            readOnly: true,
            inputProps: {
              "aria-live": "polite",
            },
          }}
          fullWidth
        />

        <div className="flex justify-center md:col-span-2">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="px-8"
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? "Processing..." : "Add Customer"}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </Box>
  );
};

export default CustomerForm;
