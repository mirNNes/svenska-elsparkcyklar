import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rentBike } from "../api/bikes";

export default function RentBike() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { bikeID } = useParams();

  const rentBikeBtn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await rentBike(bikeID)
      console.log(response);
      navigate(`/current_ride/${response.id}`, { replace: true });
    } catch (err) {
      console.log(err);
      const msg =
        err.response?.error || "Kunde inte hyra cykeln.";
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

