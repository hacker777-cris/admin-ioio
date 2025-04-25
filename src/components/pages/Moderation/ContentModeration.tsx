import React, { useState, useEffect } from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import { moderationService } from "../../../services/moderation.service";
import {
  MessageSquare,
  AlertTriangle,
  Flag,
  Star,
  CheckCircle,
  XCircle,
  Search,
  Eye,
} from "lucide-react";
import Tabs from "../../ui/Tabs";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";
import { formatDate } from "../../../utils/formatters";
import MessageReportList from "./MessageReportList";
import FlaggedMessageList from "./FlaggedMessageList";
import OwnerReportList from "./OwnerReportList";
import ReviewList from "./ReviewList";

const ContentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState("message-reports");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    messageReports: 0,
    flaggedMessages: 0,
    ownerReports: 0,
    flaggedReviews: 0,
  });

  const { showError } = useNotification();

  useEffect(() => {
    fetchModerationStats();
  }, []);

  const fetchModerationStats = async () => {
    setLoading(true);
    try {
      const moderationStats =
        await moderationService.getContentModerationStats();

      setStats({
        messageReports: moderationStats?.message_reports?.pending || 0,
        flaggedMessages: moderationStats?.flagged_messages?.pending || 0,
        ownerReports: moderationStats?.owner_reports?.pending || 0,
        flaggedReviews: moderationStats?.reviews?.flagged || 0,
      });
    } catch (error) {
      showError("Failed to load moderation statistics");
      console.error("Moderation stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "message-reports",
      label: "Message Reports",
      count: stats.messageReports,
      icon: <MessageSquare size={16} />,
    },
    {
      id: "flagged-messages",
      label: "Flagged Messages",
      count: stats.flaggedMessages,
      icon: <Flag size={16} />,
    },
    {
      id: "owner-reports",
      label: "Owner Reports",
      count: stats.ownerReports,
      icon: <AlertTriangle size={16} />,
    },
    {
      id: "flagged-reviews",
      label: "Flagged Reviews",
      count: stats.flaggedReviews,
      icon: <Star size={16} />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-gray-600 mt-1">
          Review and manage reported content across the platform
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        <Card>
          <div className="p-4">
            {activeTab === "message-reports" && <MessageReportList />}

            {activeTab === "flagged-messages" && <FlaggedMessageList />}

            {activeTab === "owner-reports" && <OwnerReportList />}

            {activeTab === "flagged-reviews" && <ReviewList />}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContentModeration;

