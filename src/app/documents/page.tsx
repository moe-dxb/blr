'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DocumentSummarizer } from './DocumentSummarizer';

const documents = [
  {
    id: "doc-001",
    name: "Employee Handbook",
    category: "HR Policy",
    lastUpdated: "2024-06-15",
    content: "This handbook outlines the company's policies, procedures, and benefits. It covers topics such as code of conduct, working hours, leave policies, and performance reviews. All employees are expected to read and understand the contents of this handbook. The company reserves the right to modify policies at its discretion."
  },
  {
    id: "doc-002",
    name: "Work From Home Policy",
    category: "HR Policy",
    lastUpdated: "2024-06-28",
    content: "The Work From Home (WFH) policy provides guidelines for employees working remotely. It details eligibility, equipment provision, communication protocols, and security requirements. Employees must maintain their regular working hours and be available during core business times. A dedicated and ergonomic workspace is required for all remote employees."
  },
  {
    id: "doc-003",
    name: "Expense Claim Guidelines",
    category: "Finance",
    lastUpdated: "2024-05-20",
    content: "This document provides instructions on how to submit expense claims. All claims must be submitted through the employee portal with valid receipts attached. Claims are subject to approval by the line manager and finance department. Reimbursable expenses include travel, accommodation, and client entertainment within pre-approved limits."
  },
  {
    id: "doc-004",
    name: "IT Security Policy",
    category: "IT",
    lastUpdated: "2024-07-01",
    content: "The IT Security Policy is designed to protect the company's information assets. It covers password management, data encryption, use of company devices, and incident reporting. All employees must complete the mandatory annual security training. Any suspected security breach must be reported to the IT helpdesk immediately."
  },
  {
    id: "doc-005",
    name: "Brand Style Guide",
    category: "Marketing",
    lastUpdated: "2024-04-10",
    content: "The Brand Style Guide ensures consistent use of the company's visual identity. It includes specifications for the logo, color palette, typography, and imagery. All public-facing materials must adhere to these guidelines to maintain brand integrity. For any questions, please contact the marketing department."
  },
];

export default function DocumentsPage() {
  const [selectedDocument, setSelectedDocument] = React.useState<{ title: string; content: string } | null>(null);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Document Repository</h1>
        <p className="text-muted-foreground">Find all company policies, guidelines, and forms here.</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground"/>
                  {doc.name}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    doc.category === "HR Policy" ? "default" : 
                    doc.category === "Finance" ? "secondary" : "outline"
                  }>{doc.category}</Badge>
                </TableCell>
                <TableCell>{doc.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <Dialog onOpenChange={(open) => !open && setSelectedDocument(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => setSelectedDocument({ title: doc.name, content: doc.content })}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Summarize
                      </Button>
                    </DialogTrigger>
                    {selectedDocument && (
                       <DialogContent className="sm:max-w-[625px]">
                         <DialogHeader>
                           <DialogTitle className="font-headline">AI Document Summary</DialogTitle>
                         </DialogHeader>
                         <DocumentSummarizer
                           documentTitle={selectedDocument.title}
                           documentContent={selectedDocument.content}
                         />
                       </DialogContent>
                    )}
                  </Dialog>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
