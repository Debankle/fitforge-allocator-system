interface ViewToolbarProps {
  setActiveView: (view: string) => void;
}

const ViewToolbar: React.FC<ViewToolbarProps> = ({ setActiveView }) => {
  return (
    <div className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("Upload")}
        >
          Upload
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("Algorithm")}
        >
          Algorithm
        </li>
        <li className="text-white cursor-pointer hover:text-gray-400">
          Spreadsheet
        </li>
        <li className="text-white cursor-pointer hover:text-gray-400">
          Allocations
        </li>
        <li className="text-white cursor-pointer hover:text-gray-400">
          Rejections
        </li>
      </ul>
    </div>
  );
};

export default ViewToolbar;
