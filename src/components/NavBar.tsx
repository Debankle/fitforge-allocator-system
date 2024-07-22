import { useNavigation } from "../NavServiceContext";

function NavBar() {
  const { navigate } = useNavigation();

  return (
    <div className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "Upload", data: null })}
        >
          Upload
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "Algorithm", data: null })}
        >
          Algorithm
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "Spreadsheet", data: null })}
        >
          Spreadsheet
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "Allocations", data: null })}
        >
          Allocations
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "Rejections", data: null })}
        >
          Rejections
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() =>
            navigate({ page: "Pairing", data: { team: 1, project: 1 } })
          }
        >
          Pairing test
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "ProjectList", data: { team: 1 } })}
        >
          Project List
        </li>
        <li
          className="text-white cursor-pointer hover:text-gray-400"
          onClick={() => navigate({ page: "TeamList", data: { project: 1 } })}
        >
          Team List
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
