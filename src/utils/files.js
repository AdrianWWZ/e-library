// "312 MB", "1.4 GB" ...
export const formatBytes = (bytes) => {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** i;
  const digits = value >= 100 || i === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${Number(value.toFixed(digits))} ${units[i]}`;
};

// Save a Blob to the user's device
export const downloadBlob = (blob, fileName) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking straight away can cancel the download in Safari/Firefox
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
};
