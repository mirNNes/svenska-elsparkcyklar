import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rentBike } from "../api/bikes";
import { httpPost } from "../api/http";

export default function RentBike() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("userUser");
  const user = JSON.parse(storedUser);
  
  const { bikeID } = useParams();
  const userID = user.id;

  const rentBikeBtn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await rentBike(bikeID, userID)
      console.log(response.data);
      const { rentData } = response.data;
      navigate(`/current_ride/${rentData.id}`, { replace: true });
    } catch (err) {
      console.log(err);
      const msg =
        err.response?.data?.error || "Fel";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="margin-div">
      <h1>Vill du hyra sparkcykel med id {bikeID}?</h1>
      <button onClick={rentBikeBtn} disabled={loading} className="green-button">
        {loading ? "Hyr cykel..." : "Börja hyra"}
      </button>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}

