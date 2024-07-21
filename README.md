# FitForge Allocation System

## TODO:

### Oliver:
- PairingDiv
    - reload on data change properly
    - move navigation options to make sense
- Google sheets loading on InputComponent
- Enable navigation through PairingDiv
- Spreadsheet view working
- clean up code and add comments for clarity


## Testing Data

Testing data has been setup to be crerated in the [tests](./tests/) directory. This can be used to test the system functionality.


The testing data should not be committed to the repo, in fact it has been ignored in the gitignore. As such, a seed has been set so the random data is the same for everyone. Modify the file to create extra if needed. A python env should be used to run the code. The requirements have been included in tests/requirements.txt.

Create a new virtual environment somewhere on your local machine.

    python3 -m venv Documents\fitforge-venv

Activate the environment and install from the requirements.txt

    venv\Scripts\activate
    python3 -m pip install -r requirements.txt

Then the testing data can be generated.

    python3 generate.py
