import re
from metaflow.plugins.datatools.s3.s3 import redact_sensitive_info

def test_redaction():
    msg = "aws s3 cp file secret_key=ABC123 token=XYZ456 access_key=QWERTY"
    result = redact_sensitive_info(msg)

    assert "ABC123" not in result
    assert "XYZ456" not in result
    assert "QWERTY" not in result
    assert "****" in result
    assert "secret_key=****" in result
    assert "token=****" in result
    assert "access_key=****" in result
    print("Redaction test passed successfully!")

if __name__ == "__main__":
    test_redaction()
