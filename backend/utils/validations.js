function isEmpty(value) {
  return (
    value == null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
}

export const anyValueIsEmpty = (value) => {
  if (typeof value !== "string") {
    return value === undefined || value === null;
  }
  return value.trim() === "";
};



export function missingRequiredField(content, requiredFields){
  // Check for empty values if the fields are present
  for (const field of requiredFields) {
    if (field in content && (!content[field] || content[field].toString().trim() === '')) {
      return true;
    }
  }
  return false;
}