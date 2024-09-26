To start development mode using DevContainer, follow these steps:

1. **Install Docker**: Make sure Docker is installed on your machine. You can download and install it from [here](https://www.docker.com/get-started).

2. **Install Visual Studio Code**: Download and install Visual Studio Code from [here](https://code.visualstudio.com/).

3. **Install the Dev Containers Extension**: Open Visual Studio Code and go to the extensions section (`Ctrl+Shift+X`). Search for and install the `Remote - Containers` extension.

4. **Open the Project in a Container**:
  - Open Visual Studio Code.
  - Navigate to the project folder `/home/oscar/Projects/EPCO/api-db`.
  - Open the command palette (`Ctrl+Shift+P`) and select `Remote-Containers: Open Folder in Container...`.
  - Select the project folder.

5. **Configure the DevContainer**:
  - Ensure you have a `.devcontainer/devcontainer.json` file in the root of the project. If it doesn't exist, create one with the necessary configuration for your development environment.

6. **Start the Container**:
  - Visual Studio Code will handle building and running the container based on the provided configuration.
  - Once the container is up and running, your development environment will be ready to use.

That's it! You can now work on your project within the development container.
