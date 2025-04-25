import React, { useState, useEffect } from "react";
import { moderationService } from "../../../services/moderation.service";
import { useNotification } from "../../../contexts/NotificationContext";
import { MessageReport } from "../../../types";
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
import { formatDate, getStatusColor } from "../../../utils/formatters";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
} from "lucide-react";

const MessageReportList: React.FC = () => {
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MessageReport | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  const { showSuccess, showError } = useNotification();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await moderationService.getMessageReports(currentPage);
      setReports(response.results);
      setTotalReports(response.count);
    } catch (error) {
      showError("Failed to load message reports");
      console.error("Error loading message reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const handleViewReport = (report: MessageReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setActionNotes("");
  };

  const handleMarkReviewed = async () => {
    if (!selectedReport) return;

    setActionInProgress(true);
    try {
      await moderationService.markMessageReportReviewed(selectedReport.id);
      showSuccess("Report marked as reviewed");

      // Update the local state
      setReports(
        reports.map((report) =>
          report.id === selectedReport.id
            ? { ...report, reviewed: true }
            : report,
        ),
      );

      handleCloseModal();
    } catch (error) {
      showError("Failed to mark report as reviewed");
      console.error("Error:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleTakeAction = async (action: string) => {
    if (!selectedReport) return;

    setActionInProgress(true);
    try {
      await moderationService.takeActionOnMessageReport(
        selectedReport.id,
        action,
        actionNotes,
      );

      showSuccess(`Action taken: ${action}`);

      // Update the local state
      setReports(
        reports.map((report) =>
          report.id === selectedReport.id
            ? { ...report, reviewed: true }
            : report,
        ),
      );

      handleCloseModal();
    } catch (error) {
      showError("Failed to take action");
      console.error("Error:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusBadge = (reviewed: boolean) => {
    return reviewed ? (
      <Badge variant="success">Reviewed</Badge>
    ) : (
      <Badge variant="warning">Pending</Badge>
    );
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
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
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
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Message Reports
      </h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>Reporter</TableCell>
            <TableCell header>Message Sender</TableCell>
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
                <p className="text-gray-500">No message reports found</p>
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {report.reported_by_username || "Unknown"}
                </TableCell>
                <TableCell>{report.message_sender || "Unknown"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {report.reason_display || report.reason}
                </TableCell>
                <TableCell>{getStatusBadge(report.reviewed)}</TableCell>
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
          title="Message Report Details"
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
              <div className="space-x-2">
                {!selectedReport.reviewed && (
                  <>
                    <Button
                      variant="secondary"
                      icon={<CheckCircle size={16} />}
                      onClick={handleMarkReviewed}
                      isLoading={actionInProgress}
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      variant="danger"
                      icon={<XCircle size={16} />}
                      onClick={() => handleTakeAction("remove_message")}
                      isLoading={actionInProgress}
                    >
                      Remove Message
                    </Button>
                    <Button
                      variant="primary"
                      icon={<AlertTriangle size={16} />}
                      onClick={() => handleTakeAction("warn_user")}
                      isLoading={actionInProgress}
                    >
                      Warn User
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                <p className="mt-1">
                  {selectedReport.reported_by_username || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedReport.reported_by}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Message Exchange
                </h3>
                <p className="mt-1">
                  <span className="font-medium">Sender:</span>{" "}
                  {selectedReport.message_sender || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Receiver:</span>{" "}
                  {selectedReport.message_receiver || "Unknown"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Report Reason
              </h3>
              <p className="mt-1">
                {selectedReport.reason_display || selectedReport.reason}
              </p>
              {selectedReport.details && (
                <p className="mt-1 text-sm text-gray-600">
                  {selectedReport.details}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Message Content
              </h3>
              <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-[#2C3E50] flex items-center justify-center text-white text-sm font-medium">
                      {selectedReport.message_sender
                        ? selectedReport.message_sender.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex-grow">
                    <p className="text-gray-800">
                      {selectedReport.message_content}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  Message ID: {selectedReport.message}
                </p>
              </div>
            </div>

            {!selectedReport.reviewed && (
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
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MessageReportList;

