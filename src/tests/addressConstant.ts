export const addressId = "string";
export const userId = "string";
export const addresses = [
  {
    id: addressId,
    receiver: "string",
    userId,
    street: "string",
    subdistrict: "string",
    district: "string",
    city: "string",
    province: "string",
    postalCode: "string",
    phone: "string",
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
export const newAddress = {
  ...addresses[0]
};
export const dataToUpdate = {
    ...addresses[0],
    addressId
}
