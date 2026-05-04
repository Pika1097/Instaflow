def success_response(message="Success", data=None):
    response = {
        "success": True,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    return response


def error_response(message="Something went wrong", data=None):
    response = {
        "success": False,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    return response
