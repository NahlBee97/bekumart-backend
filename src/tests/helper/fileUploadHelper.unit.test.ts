import {
  bufferToDataURI,
  getPublicIdFromUrl,
} from "../../helper/fileUploadHelper";

import { Buffer } from "buffer";

describe("bufferToDataURI", () => {
  it("should correctly convert a buffer to a data URI", () => {
    const text = "hello world";
    const buffer = Buffer.from(text, "utf-8");
    const mimeType = "text/plain";

    const result = bufferToDataURI(buffer, mimeType);

    const expected = "data:text/plain;base64,aGVsbG8gd29ybGQ=";
    expect(result).toBe(expected);
  });

  it("should work with a different mime type", () => {
    const text = "<svg></svg>";
    const buffer = Buffer.from(text, "utf-8");
    const mimeType = "image/svg+xml";

    const result = bufferToDataURI(buffer, mimeType);

    const expected = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
    expect(result).toBe(expected);
  });

  it("should handle an empty buffer", () => {
    const buffer = Buffer.alloc(0); // Buffer kosong
    const mimeType = "application/octet-stream";

    const result = bufferToDataURI(buffer, mimeType);

    const expected = "data:application/octet-stream;base64,";
    expect(result).toBe(expected);
  });
});

describe("getPublicIdFromUrl", () => {
  const testCases = [
    {
      url: "https://res.cloudinary.com/demo/image/upload/v1678886400/folder/my_image.jpg",
      expected: "folder/my_image",
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/v1678886400/my_image.png",
      expected: "my_image",
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/v1678886400/folder1/folder2/pic.gif",
      expected: "folder1/folder2/pic",
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/v1678886400/my.image.with.dots.webp",
      expected: "my.image.with.dots",
    },
    {
      url: "https://some-other-domain.com/images/my_image.jpg",
      expected: null, // Tidak ada 'upload'
    },
    {
      url: "https://res.cloudinary.com/demo/image/upload/",
      expected: null, // Terlalu pendek
    },
    {
      url: "invalid-url-string",
      expected: null, // Tidak ada 'upload'
    },
  ];

  it.each(testCases)(
    'should extract publicId "$expected" from "$url"',
    ({ url, expected }) => {
      expect(getPublicIdFromUrl(url)).toBe(expected);
    }
  );

  it("should return an empty string if the file has no extension (POTENTIAL BUG)", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/v1678886400/image_no_ext";

    const publicId = getPublicIdFromUrl(url);

    expect(publicId).toBe("");
  });
});
