'use client'
import React from 'react';
import ResizableTable from '@/components/mf/ReportingToolTable';

const Teams = () => {
  const columns = [
    { title: "Name", key: "name" },
    { title: "Role", key: "role" },
    { title: "Email", key: "email" },
    { title: "Phone No", key: "phone" },
    { title: "Status", key: "status" },
    { title: "Active/Inactive", key: "active" },
  ];

  const data = [
    {
      id: 1,
      name: "John Doe",
      role: "Admin",
      email: "john@example.com",
      phone: "123-456-7890",
      status: "Online",
      active: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "User",
      email: "jane@example.com",
      phone: "234-567-8901",
      status: "Offline",
      active: "Inactive",
    },
    {
      id: 3,
      name: "Alice Johnson",
      role: "Editor",
      email: "alice@example.com",
      phone: "345-678-9012",
      status: "Busy",
      active: "Active",
    },
  ];

  return (
    <div className="overflow-x-auto"> {/* Ensure the table is scrollable horizontally on small screens */}
      <ResizableTable
        columns={columns}
        data={data}
        isEdit={true}
        isDelete={true}
        isView={true}
        isDownload={true}
        isSelectable={true}
        actionButton={<button>Action Button</button>}
        onEdit={(item) => console.log("Edit", item)}
        onDelete={(item) => console.log("Delete", item)}
        onView={(item) => console.log("View", item)}
        onDownload={(item) => console.log("Download", item)}
        onDownloadAll={() => console.log("Download All")}
        onSelect={(selectedItems) => console.log("Selected Items", selectedItems)}
      />
    </div>
  );
};

export default Teams;
