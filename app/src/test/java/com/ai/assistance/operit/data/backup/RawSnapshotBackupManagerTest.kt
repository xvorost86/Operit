package com.ai.assistance.operit.data.backup

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RawSnapshotBackupManagerTest {

    @Test
    fun snapshotPackageName_acceptsOperitPackagePrefix() {
        assertTrue(isSupportedSnapshotPackageName("com.ai.assistance.operit"))
        assertTrue(isSupportedSnapshotPackageName("com.ai.assistance.operit.debug"))
        assertTrue(isSupportedSnapshotPackageName("com.ai.assistance.operit.clone"))
    }

    @Test
    fun snapshotPackageName_acceptsForkPackagePrefix() {
        assertTrue(isSupportedSnapshotPackageName("ru.xvorost.operit"))
        assertTrue(isSupportedSnapshotPackageName("ru.xvorost.operit.debug"))
        assertTrue(isSupportedSnapshotPackageName("ru.xvorost.operit.clone"))
    }

    @Test
    fun snapshotPackageName_rejectsDifferentPackagePrefix() {
        assertFalse(isSupportedSnapshotPackageName("com.ai.assistance.other"))
        assertFalse(isSupportedSnapshotPackageName("com.example.operit"))
    }

    @Test
    fun snapshotPackageName_requiresDotBoundaryAfterFamily() {
        // Same prefix without a package boundary is a different application, not a build variant.
        assertFalse(isSupportedSnapshotPackageName("com.ai.assistance.operitx"))
        assertFalse(isSupportedSnapshotPackageName("ru.xvorost.operitx"))
    }
}
