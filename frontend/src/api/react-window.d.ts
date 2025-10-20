declare module "react-window" {
  import * as React from "react";

  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
    data?: any;
  }

  export interface FixedSizeListProps {
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: number;
    children: React.ComponentType<ListChildComponentProps>;
    [key: string]: any;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {}
  export class VariableSizeList extends React.Component<any> {}
}
