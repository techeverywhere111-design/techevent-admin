import React from "react";
import { CircleUserRound } from "lucide-react";
import { formatDateTime } from "@/lib/utils/date";

export interface ClientInfoProps {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  name: string | null | undefined;
  email: string | null | undefined;
  planType: string | null | undefined;
  dateJoined: string | null | undefined;
  profileImage?: string | null;
}


const ClientProfileCard: React.FC<ClientInfoProps> = ({
  firstName,
  lastName,
  name,
  email,
  planType,
  dateJoined,
  profileImage,
}) => {
  return (
    <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 mx-auto sm:mx-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <CircleUserRound className="w-full h-full text-gray-400 p-8" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-4 flex-1">
          {name ? (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Business Name
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {name}
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {firstName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {lastName}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Email
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
              {email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Plan Type
            </p>
            {name ? (
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Business
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {planType}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Date Joined
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDateTime(dateJoined)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileCard;
