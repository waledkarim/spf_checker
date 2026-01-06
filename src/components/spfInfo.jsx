import "./spfInfo.css";

function SPFInfo({ record }) {
  return (
    <div className="results__text--success">
      {record.split(" ").map((part, index) => {
        const isHighlight =
          part.startsWith("include:") || part.startsWith("redirect=");

        return (
          <span key={index} className={`${isHighlight && "spf-highlight"}`}>
            {part}{" "}
          </span>
        );
      })}
    </div>
  );
}

export default SPFInfo;
