import { Button, Html } from "@react-email/components";
import * as React from "react";

export default function Newsletter({ confirmUrl }: { confirmUrl: string }) {
  return (
    <Html>
      <p>Confirm your subscription</p>
      <Button
        href={confirmUrl}
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Subscribe to Newsletter
      </Button>
      <p>If you did not subscribe to this newsletter, please ignore this email.</p>
      <p>Thank you!</p>
      <p>
        For questions about this list, please contact us at{" "}
        <a href="mailto:support@cmotd.org">support@cmotd.org</a>.
      </p>
    </Html>
  );
}
