declare module "react-edit-text" {
  import { Component, CSSProperties } from "react";

  interface EditTextProps {
    name?: string;
    defaultValue?: string;
    value?: string;
    placeholder?: string;
    type?: string;
    readonly?: boolean;
    style?: CSSProperties;
    className?: string;
    onSave?: (data: { name: string; value: string; previousValue: string }) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }

  export class EditText extends Component<EditTextProps> {}
}
