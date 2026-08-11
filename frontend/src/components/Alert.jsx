import React from "react";

export default function Alert({ type = "error", message }) {
  if (!message) return null;
  return <div className={`alert alert-${type}`}>{message}</div>;
}
