// frontend/src/config/sms_config.ts
export const smsConfig = {
  providers: {
    umesikia: {
      senderId: "UMS_SMS"
    },
    blessed_texts: {
      senderId: "FERRITE"
    }
  },

  templates: {
    appointment: (
      farmer: string,
      phone: string,
      date: string,
      locality: string,
      ward: string,
      sub_county: string,
      county: string,
      lat?: number,
      lng?: number
    ) => {
      const locationStr = [locality, ward, sub_county, county]
        .filter((val) => val && val !== "Not specified")
        .join(", ") || "Not specified";

      let mapLink = "";
      if (lat && lng) {
        mapLink = `\nhttps://maps.google.com/?q=${lat},${lng}`;
      }

      return `Vet Appointment Request
Farmer: ${farmer}
Phone: ${phone || "N/A"}
Date: ${date}
Location: ${locationStr}${mapLink}`;
    },
  },

  validation: {
    requireKenyanNumbers: true,
    maxLength: 160
  }
};
