import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { addDays, format, set } from "date-fns";
import { Input } from "../ui/input";
import axios from "axios";
import apiUrl from "../../lib/apiUrl";

export default function ImportDataModal(onDataImported = () => {}) {
  const [date, setDate] = useState(new Date());
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const [importResponse, setImportResponse] = useState({});

  const [dialogueOne, setDialogueOne] = useState(undefined);
  const [dialogueTwo, setDialogueTwo] = useState(undefined);
  const [invoicingReport, setInvoicingReport] = useState(undefined);

  const [error, setError] = useState(undefined);

  const importData = async () => {
    setError(undefined);

    const formData = new FormData();

    if (dialogueOne === undefined) {
      setError("Dialogue 1 must be selected.");
      setImporting(false);
      return;
    }

    if (dialogueTwo === undefined) {
      setError("Dialogue 2 must be selected.");
      setImporting(false);
      return;
    }

    if (invoicingReport === undefined) {
      setError("Invoicing Report must be selected.");
      setImporting(false);
      return;
    }

    if (dialogueOne instanceof File) {
      if (!dialogueOne.name.endsWith(".xlsx")) {
        setError("Dialogue 1 must be an Excel file.");
        setImporting(false);
        return;
      }

      if (!dialogueOne.name.includes(format(addDays(date, -6), "yyyy-MM-dd"))) {
        setError("Dialogue 1 must be for the correct date.");
        setImporting(false);
        return;
      }
    }

    if (dialogueTwo instanceof File) {
      if (!dialogueTwo.name.endsWith(".xlsx")) {
        setError("Dialogue 2 must be an Excel file.");
        setImporting(false);
        return;
      }

      if (!dialogueTwo.name.includes(format(date, "yyyy-MM-dd"))) {
        setError("Dialogue 2 must be for the correct date.");
        setImporting(false);
        return;
      }
    }

    if (invoicingReport instanceof File) {
      if (!invoicingReport.name.endsWith(".csv")) {
        setError("Invoicing Report must be a CSV file.");
        setImporting(false);
        return;
      }
    }

    setImporting(true);

    formData.append("dialogue-1.xlsx", dialogueOne);
    formData.append("dialogue-2.xlsx", dialogueTwo);
    formData.append("invoicing-report.csv", invoicingReport);

    const importResponse = await axios.post(
      apiUrl + "/upload-and-process?date=" + format(date, "yyyy-MM-dd") + "",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (importResponse.status === 200) {
      setImportResponse(importResponse.data);
      setImported(true);

      setTimeout(() => {
        setImported(false);

        onDataImported();
      }, 5000);
    } else {
      setError(importResponse.data.message);
      setImporting(false);
      return;
    }

    setImporting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Import Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Import Data</DialogTitle>
          {!error ? (
            <DialogDescription>
              Please select the date you would like to import data for and also
              select the corresponding files required.
            </DialogDescription>
          ) : (
            <DialogDescription className="text-red-600">
              {error}
            </DialogDescription>
          )}
        </DialogHeader>
        {!importing && !imported && (
          <div className="flex flex-col w-full h-auto space-y-5">
            <div className="flex flex-col w-full h-auto space-y-3">
              <div className="text-lg font-semibold">Import Date</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col w-full h-auto space-y-3">
              <div>{format(addDays(date, -6), "PPP")}'s Dialogue</div>
              <Input
                type="file"
                onChange={(event) => setDialogueOne(event.target.files[0])}
              />
            </div>
            <div className="flex flex-col w-full h-auto space-y-3">
              <div>{format(date, "PPP")}'s Dialogue</div>
              <Input
                type="file"
                onChange={(event) => setDialogueTwo(event.target.files[0])}
              />
            </div>
            <div className="flex flex-col w-full h-auto space-y-3">
              <div>{format(date, "MMMM")}'s Invoicing Document</div>
              <Input
                type="file"
                onChange={(event) => setInvoicingReport(event.target.files[0])}
              />
            </div>
          </div>
        )}
        {importing && !imported && <div>Importing data...</div>}
        {!importing && imported && (
          <div className="grid w-full h-auto grid-cols-2 gap-3">
            <div>{importResponse.message}</div>
            <div></div>

            <div>New Invoices</div>
            <div>{importResponse.inserted_invoices}</div>

            <div>Updated Invoices</div>
            <div>{importResponse.updated_invoices}</div>

            <div>Skipped Invoices</div>
            <div>{importResponse.skipped_invoices}</div>

            <div>New Shifts</div>
            <div>{importResponse.new_shifts}</div>

            <div>Skipped Shifts</div>
            <div>{importResponse.skipped_shifts}</div>

            <div>New Teachers</div>
            <div>{importResponse.new_teachers}</div>

            <div>Skipped Teachers</div>
            <div>{importResponse.skipped_teachers}</div>
          </div>
        )}
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => importData()}
            disabled={importing || imported}
          >
            Begin Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
