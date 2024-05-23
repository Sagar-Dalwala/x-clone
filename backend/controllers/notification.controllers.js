import { Notification } from "../models/notification.models.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notification);
  } catch (error) {
    console.log("Error in getNotifications controller: ", error.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications controller: ", error.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const deleteNotification = async (req, res) => {
//   try {
//     // const { id } = req.params;
//     // await Notification.findByIdAndDelete(id);
//     // res.status(200).json({ message: "Notification deleted successfully" });

//     const notificationId = req.params.id;
//     const userId = req.user._id;
//     const notification = await Notification.findById(notificationId);

//     if (!notification) {
//       res.status(404).json({ error: "Notification not found" });
//     }

//     if (notification.to.toString() !== userId.toString()) {
//       res
//         .status(401)
//         .json({ error: "Unauthorized to delete this notification" });
//     }

//     await notification.deleteOne({ to: notificationId });
//     // await Notification.findByIdAndDelete(notificationId);

//     res.status(200).json({ message: "Notification deleted successfully" });
//   } catch (error) {
//     console.log("Error in deleteNotification controller: ", error.message);

//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
