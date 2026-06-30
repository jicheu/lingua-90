#!/bin/bash

#=================================================
# COMMON VARIABLES AND CUSTOM HELPERS
#=================================================

# Where the per-learner JSON profiles live (mirrors the systemd Environment).
# $data_dir is provided by the [resources.data_dir] resource.

# The API base path the front-end should call. The server is reverse-proxied
# with the install path stripped, but the browser still requests absolute URLs,
# so the built front-end must know its public sub-path (e.g. "/lingua90/api").
# For a root install ("/") this collapses to "/api".
_api_base_for_path() {
    local p="${1%/}"
    echo "${p}/api"
}
