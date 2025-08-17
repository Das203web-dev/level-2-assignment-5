import { ClientSession } from "mongoose";
import { ParcelStatus } from "../modules/parcel/parcel.interface";
import { Parcel } from "../modules/parcel/parcel.model";

export const handleParcelStatusUpdate = async (parcelTrackingId: string, status: ParcelStatus, location = "", session: ClientSession | null = null) => {
    const date = new Date()
    const formatDate = date.toLocaleString("en-BD")
    const note = `This parcel is ${status} on ${formatDate}`
    const updatedParcel = await Parcel.findOneAndUpdate(
        { trackingId: parcelTrackingId },
        {
            parcelStatus: status,
            $push: {
                trackingEvent: {
                    location,
                    status: {
                        parcelStatus: status,
                        date: date
                    },
                    note
                }
            }
        },
        {
            new: true
        }
    ).session(session)
    return updatedParcel
}