import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const alt = "DIME GROUPE – L'expertise digitale au service de vos projets";
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #243E8E 0%, #CFAE63 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAFAFA",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>
          DIME GROUPE
        </div>
        <div style={{ fontSize: 32, fontWeight: 400, opacity: 0.9 }}>
          L'expertise digitale au service de vos projets
        </div>
        <div style={{ fontSize: 24, marginTop: 32, opacity: 0.8 }}>
          Côte d'Ivoire
        </div>
      </div>
    ),
    { ...size }
  );
}


