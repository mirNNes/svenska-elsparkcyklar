import { useEffect, useState } from "react";
import { getAllBikes } from "../api/bikes";
import BikeList from "../components/BikeList";
import { rentBike } from "../api/bikes";

// export default function RentBike() {
//   const [bikes, setBikes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const storedToken = localStorage.getItem("userToken");
//   const storedRefresh = localStorage.getItem("userRefreshToken");
//   const storedUser = localStorage.getItem("user");
  
//   const bikeID = this.props.id;
//   const userID = storedUser.id;

//   async function rentBike() {
//     setLoading(true);
//     setError(null);

//     let cancelled = false;

//     (async () => {
  
//       try {
//         const response = await httpPost("/bike/rent/", {
//           bikeID,
//           userID,
//         });
  
//         // Backend svarar med access_token, refresh_token och user
//         const { access_token, refresh_token, user } = response.data;
  
//         // Skicka vidare till App.jsx
//         onLogin(access_token, refresh_token, user);
  
//         // Gå till dashboard
//         navigate("/", { replace: true });
//       } catch (err) {
//         console.log(err);
//         const msg =
//           err.response?.data?.error || "Felaktig e-post eller lösenord";
//         setError(msg);
//       } finally {
//         setLoading(false);
//       }
//     }
//   )

//   return (
//     <div>
//       <h1>Vill du hyra sparkcykel med id ({bikeID})?</h1>
//       <button onClick={rentBike()}>Hyr elsparkcykel #({bikeID})</button>
//     </div>
//   );
// }

export default function RentBike() {
  return (
    <div>
      <h1>Vill du hyra sparkcykel med id ({bikeID})?</h1>
      <button>Hyr elsparkcykel #({bikeID})</button>
    </div>
  );
}
