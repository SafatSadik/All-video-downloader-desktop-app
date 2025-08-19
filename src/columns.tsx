import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  title: string
  size:string 
  status:  "processing" | "completed" | "failed" | string
  time_left:string
  transfer_rate:string
  downloaded_at:string
  file_saved_at:string
}

export const columns: ColumnDef<Payment>[] = [
  // {
  //   accessorKey: "id",
  //   header: "id",
  // },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "time_left",
    header: "Time Left",
  },
  {
    accessorKey: "transfer_rate",
    header: "Transfer Rate",
  },
  {
    accessorKey: "file_saved_at",
    header: "File saved at",
  },
   {
    accessorKey: "downloaded_at",
    header: "Downloaded at",
  },
]