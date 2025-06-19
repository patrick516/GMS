import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Debtor {
  _id: string;
  name: string;
  payment: number;
  balance: number;
  paymentStatus: string;
}

const DebtorList = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [paymentInputs, setPaymentInputs] = useState<{ [id: string]: number }>(
    {}
  );
  const [popupVisible, setPopupVisible] = useState<string | null>(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [fullPaymentMessage, setFullPaymentMessage] = useState("");

  useEffect(() => {
    const fetchDebtors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/customers/debtors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data.data;
        setDebtors(data);
        calculateTotals(data);
      } catch (error) {
        console.error("Failed to fetch debtors:", error);
        toast.error("Failed to load debtors.");
      }
    };

    fetchDebtors();
  }, []);

  const calculateTotals = (data: Debtor[]) => {
    const paid = data.reduce((sum, d) => sum + (d.payment || 0), 0);
    const pending = data.reduce((sum, d) => sum + (d.balance || 0), 0);
    setTotalPaid(paid);
    setTotalPending(pending);
  };

  const formatCurrency = (amount: number) =>
    `MK${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const handleInputChange = (id: string, value: number) => {
    setPaymentInputs({ ...paymentInputs, [id]: value });
    const debtor = debtors.find((d) => d._id === id);
    const remaining = debtor ? debtor.balance - value : 0;
    setPopupVisible(remaining >= 0 ? id : null);
  };

  const handlePayNow = async (id: string) => {
    const amount = paymentInputs[id];
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    const debtor = debtors.find((d) => d._id === id);
    if (!debtor) return;

    if (amount > debtor.balance) {
      toast.error("Payment exceeds balance.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/customers/${id}/pay`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = debtors.map((d) => {
        if (d._id === id) {
          const newBalance = d.balance - amount;
          return {
            ...d,
            balance: newBalance,
            payment: d.payment + amount,
            paymentStatus: newBalance <= 0 ? "Paid" : "Pending",
          };
        }
        return d;
      });

      const filtered = updated.filter((d) => d.balance > 0);
      const cleared = updated.find(
        (d) => d._id === id && d.balance - amount <= 0
      );

      setDebtors(filtered);
      calculateTotals(filtered);
      setPaymentInputs({ ...paymentInputs, [id]: 0 });

      if (cleared) {
        setFullPaymentMessage(
          `${cleared.name} has paid in full and was removed.`
        );
        setTimeout(() => setFullPaymentMessage(""), 5000);
      }

      toast.success("Payment updated.");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment.");
    }
  };

  return (
    <div className="p-6 mx-auto mt-10 text-black bg-white shadow max-w-7xl rounded-xl">
      <h2 className="mb-4 text-2xl font-bold">Debtor List</h2>

      <div className="flex justify-between mb-6 text-xl font-bold ">
        <p>
          Total Paid:{" "}
          <span className="font-bold text-[#24397b]">
            {formatCurrency(totalPaid)}
          </span>
        </p>
        <p>
          Total Pending:{" "}
          <span className="font-bold text-[#24397b]">
            {formatCurrency(totalPending)}
          </span>
        </p>
      </div>

      {fullPaymentMessage && (
        <div className="p-4 mb-4 text-center text-green-800 bg-green-100 border border-green-400 rounded">
          {fullPaymentMessage}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr className="text-xl text-left text-gray-700">
              <th className="p-3">No:</th>
              <th className="p-3">Name</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Pay Now</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {debtors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-5 text-center text-gray-500">
                  No debtors found.
                </td>
              </tr>
            ) : (
              debtors.map((debtor, index) => (
                <tr
                  key={debtor._id}
                  className="text-lg border-t border-gray-200"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{debtor.name}</td>
                  <td className="p-3">{formatCurrency(debtor.payment)}</td>
                  <td className="p-3">{formatCurrency(debtor.balance)}</td>
                  <td className="relative p-3">
                    <input
                      type="number"
                      className="w-full px-2 py-1 text-sm border rounded"
                      value={paymentInputs[debtor._id] || ""}
                      onChange={(e) =>
                        handleInputChange(debtor._id, Number(e.target.value))
                      }
                      onBlur={() => setPopupVisible(null)}
                      onFocus={() =>
                        handleInputChange(
                          debtor._id,
                          paymentInputs[debtor._id] || 0
                        )
                      }
                      disabled={debtor.balance <= 0}
                    />
                    {popupVisible === debtor._id && (
                      <div className="absolute left-0 p-1 mb-1 text-base text-black bg-gray-100 rounded shadow bottom-full">
                        Remaining:{" "}
                        {formatCurrency(
                          debtor.balance - (paymentInputs[debtor._id] || 0)
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">{debtor.paymentStatus}</td>
                  <td className="p-3">
                    <button
                      className={`px-4 py-1 text-white rounded ${
                        debtor.balance <= 0
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={() => handlePayNow(debtor._id)}
                      disabled={debtor.balance <= 0}
                    >
                      {debtor.balance <= 0 ? "Cleared" : "Pay"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DebtorList;
