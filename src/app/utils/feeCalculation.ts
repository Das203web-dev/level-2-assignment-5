import { ParcelType } from "../modules/parcel/parcel.interface";
const feeObjects: Record<ParcelType, { base: number; freeWeight: number; ratePerKg: number; }> = {
    [ParcelType.DOCUMENT]: { base: 50, freeWeight: 2, ratePerKg: 50 },
    [ParcelType.BOX]: { base: 80, freeWeight: 4, ratePerKg: 50 },
    [ParcelType.FRAGILE]: { base: 100, freeWeight: 2, ratePerKg: 100 },
    [ParcelType.LARGE]: { base: 150, freeWeight: 10, ratePerKg: 150 }
};



export const feeCalculation = (type: ParcelType, weight: number) => {
    const parcelType = feeObjects[type];
    let fee;
    if (weight <= parcelType.freeWeight) {
        fee = parcelType.base
        return fee
    }
    const calculateWeight = (weight - parcelType.freeWeight);
    fee = parcelType.base + calculateWeight * parcelType.ratePerKg;
    return Number(fee)
}