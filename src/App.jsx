import { useReducer } from "react";
import "./App.css";
import Error from "./components/Error";
import SPFInfo from "./components/spfInfo";

const initialState = {
  domain: "",
  loading: false,
  error: "",
  spfRecords: [],
};

function spfReducer(state, action) {
  switch (action.type) {
    case "SET_DOMAIN":
      return { ...state, domain: action.payload };

    case "FETCH_START":
      return { ...state, loading: true, error: "" };

    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        spfRecords: action.payload,
        error: "",
      };

    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        spfRecords: [],
      };

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(spfReducer, initialState);
  const { domain, loading, error, spfRecords } = state;

  const isValidDomain = (value) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);

  const checkSPF = async (e) => {
    e.preventDefault();

    if (!isValidDomain(domain)) {
      dispatch({
        type: "FETCH_ERROR",
        payload: "Please enter a valid domain name.",
      });

      return;
    }

    dispatch({ type: "FETCH_START" });

    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${domain}&type=TXT`
      );

      const data = await response.json();

      if (!data.Answer) {
        dispatch({
          type: "FETCH_ERROR",
          payload: "No TXT records found.",
        });
        console.log("No TXT records found.");

        return;
      }

      const spf = data.Answer.map((record) =>
        record.data.replace(/"/g, "")
      ).filter((txt) => txt.startsWith("v=spf1"));

      if (spf.length === 0) {
        dispatch({
          type: "FETCH_ERROR",
          payload: "No SPF record found for this domain.",
        });
        console.log("No SPF record found for this domain.");
      } else {
        dispatch({
          type: "FETCH_SUCCESS",
          payload: spf,
        });
        console.log("Fetched spf records");
      }
    } catch {
      console.log("Failed to fetch spf records");

      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to fetch SPF records.",
      });
    }
  };

  return (
    <main className="main">
      <form className="spfForm" onSubmit={checkSPF}>
        <h1 className="spfForm__title">Check SPF</h1>
        <input
          className="spfForm__input"
          type="text"
          placeholder="Enter Domain"
          name="domain"
          id="domain"
          value={domain}
          onChange={(e) =>
            dispatch({ type: "SET_DOMAIN", payload: e.target.value })
          }
        />
        <button disabled={loading} className="spfForm__btn">
          {loading ? "Please wait..." : "Check SPF"}
        </button>
      </form>
      <div className="results">
        {spfRecords.length > 0 &&
          spfRecords.map((record, index) => (
            <SPFInfo key={index} record={record} />
          ))}
        {error && <Error error={error} />}
      </div>
    </main>
  );
}

export default App;
