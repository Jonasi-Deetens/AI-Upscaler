declare module "qrcode" {
  interface Options {
    width?: number;
    margin?: number;
    type?: "image/png" | "image/jpeg" | "image/webp";
  }
  function toDataURL(text: string, options?: Options): Promise<string>;
}
