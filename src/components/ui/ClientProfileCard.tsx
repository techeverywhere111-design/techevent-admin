import React from "react";

export interface ClientInfoProps {
  firstName: string;
  lastName: string;
  email: string;
  planType: string;
  dateJoined: string;
  profileImage?: string;
}

const ClientProfileCard: React.FC<ClientInfoProps> = ({
  firstName,
  lastName,
  email,
  planType,
  dateJoined,
  profileImage,
}) => {
  return (
    <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 mb-6 transition-colors duration-300">
      <div className="flex gap-6">
        <div className="w-30 h-30 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://placehold.co/200x200?text=+"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-x-12 gap-y-4 flex-1">
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
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Email
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Plan Type
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {planType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Date Joined
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {dateJoined}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileCard;
