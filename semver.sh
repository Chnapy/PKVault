#!/bin/bash

bump_version() {
  local version=$1
  local type=$2

  # Remove the leading 'v' and split the version into components
  version=${version#v}
  IFS='.' read -r -a parts <<< "$version"

  # Extract the major, minor, and patch components
  major=${parts[0]}
  minor=${parts[1]}
  patch=${parts[2]}

  # Bump the appropriate component
  case $type in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      echo "Invalid type: $type. Use 'major', 'minor', or 'patch'."
      exit 1
      ;;
  esac

  # Print the new version
  echo "v$major.$minor.$patch"
}

# Call the function with the passed arguments
bump_version "$1" "$2"