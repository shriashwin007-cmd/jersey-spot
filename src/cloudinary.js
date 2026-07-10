// Insert a Cloudinary transformation string into an existing delivery URL.
export function cld(url, transform) {
  return url.replace('/upload/', `/upload/${transform}/`);
}
