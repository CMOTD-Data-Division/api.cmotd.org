import { Html } from "@react-email/components";
import * as React from "react";

export function Feedback({ name, email, message }: { name: string; email: string; message: string }) {
  const lines = message.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <Html>
      <h2>{name}</h2>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Message:</strong>
        <br />
        {lines}
      </p>
      <p>Submitted</p>
    </Html>
  );
}
