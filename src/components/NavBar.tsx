interface NavBarProps {
  setActiveView: (view: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ setActiveView }) => {
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
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("Spreadsheet")}
        >
          Spreadsheet
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("Allocations")}
        >
          Allocations
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("Rejections")}
        >
          Rejections
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("Pairing")}
        >
          Pairing test
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("ProjectList")}
        >
          Project List
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => setActiveView("TeamList")}
        >
          Team List
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
