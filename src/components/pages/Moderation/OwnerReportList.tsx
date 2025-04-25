import React, { useState, useEffect } from "react";
import { moderationService } from "../../../services/moderation.service";
import { useNotification } from "../../../contexts/NotificationContext";
import { OwnerReport } from "../../../types";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from "../../ui/Table";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import { formatDate } from "../../../utils/formatters";
import { CheckCircle, XCircle, AlertTriangle, Eye, UserX } from "lucide-react";

const OwnerReportList: React.FC = () => {
  const [reports, setReports] = useState<OwnerReport[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<OwnerReport | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { showSuccess, showError } = useNotification();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await moderationService.getOwnerReports(currentPage);
      setReports(response.results);
      setTotalReports(response.count);
    } catch (error) {
      showError("Failed to load owner reports");
      console.error("Error loading owner reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const handleViewReport = (report: OwnerReport) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setActionNotes("");
    setNewStatus("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return;

    setActionInProgress(true);
    try {
      await moderationService.updateOwnerReportStatus(
        selectedReport.id,
        newStatus,
        actionNotes,
      );

      showSuccess(`Status updated to ${newStatus}`);

      // Update the local state
      setReports(
        reports.map((report) =>
          report.id === selectedReport.id
            ? { ...report, status: newStatus }
            : report,
        ),
      );

      handleCloseModal();
    } catch (error) {
      showError("Failed to update status");
      console.error("Error:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "INVESTIGATING":
        return <Badge variant="info">Investigating</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Render skeletons while loading
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-800 mb-4">Owner Reports</h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>Reporter</TableCell>
            <TableCell header>Reported Owner</TableCell>
            <TableCell header>Reason</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Date</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            renderSkeletons()
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <p className="text-gray-500">No owner reports found</p>
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.reporter_username || "Unknown"}</TableCell>
                <TableCell>
                  {report.reported_user_username || "Unknown"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {report.reason}
                </TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell>{formatDate(report.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye size={16} />}
                    onClick={() => handleViewReport(report)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        totalItems={totalReports}
        itemsPerPage={10}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {selectedReport && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Owner Report Details"
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
              <div className="space-x-2">
                <Button
                  variant="primary"
                  icon={<CheckCircle size={16} />}
                  onClick={handleUpdateStatus}
                  isLoading={actionInProgress}
                  disabled={selectedReport.status === newStatus}
                >
                  Update Status
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                <p className="mt-1">
                  {selectedReport.reporter_username || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedReport.reporter}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Reported Owner
                </h3>
                <p className="mt-1">
                  {selectedReport.reported_user_username || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedReport.reported_user}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Report Reason
              </h3>
              <p className="mt-1">{selectedReport.reason}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="whitespace-pre-line">
                  {selectedReport.description || "No description provided"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Admin Notes</h3>
              <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="whitespace-pre-line">
                  {selectedReport.admin_notes || "No admin notes"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Update Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={[
                    { value: "PENDING", label: "Pending" },
                    { value: "INVESTIGATING", label: "Investigating" },
                    { value: "RESOLVED", label: "Resolved" },
                    { value: "REJECTED", label: "Rejected" },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Action Notes (Optional)
              </h3>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2C3E50] focus:ring focus:ring-[#2C3E50] focus:ring-opacity-50"
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add notes about the action taken..."
              ></textarea>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OwnerReportList;

